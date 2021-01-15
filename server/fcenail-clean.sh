#!/bin/bash

if [[ $(whoami) != "root" ]]; then
  echo -e "Error: this must be run as root: sudo $0 [file.img]"
  exit
fi

NETWORK=0
ENAIL=0
HELP=0
IMGFILE=""
POSITIONAL=()

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -h|--help)
    HELP=1
    shift # past argument
    ;;
    -n|--network)
    NETWORK=1
    shift # past argument
    ;;
    -i|--image|--img)
    shift # past argument
    IMGFILE="$1"
    shift # past value
    ;;
    -e|--enail)
    ENAIL=1
    shift # past argument
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [ $HELP -eq 1 ]; then
  echo -e '\nUsage:\n'
  echo -e '\tclean.sh [-i|--image|--img <imagefile>] [-n|--network] [-e|--enail] [-h|--help]\n\n'
  exit 0
fi

mountdir=
if [[ -e "$IMGFILE" ]]; then
  echo -e '\n[+] Mounting $IMGFILE.'
  part_info=$(parted -m "$IMGFILE" unit B print)
  part_num=$(echo "$part_info" | grep ext4 | cut -d':' -f1)
  part_start=$(echo "$part_info" | grep ext4 | cut -d':' -f2 | sed 's/B//g')
  part_size=$(echo "$part_info" | grep ext4 | cut -d':' -f4 | sed 's/B//g')
  loopback=$(losetup -f --show -o "$part_start" "$IMGFILE")
  mountdir=$(mktemp -d)
  mount "$loopback" "$mountdir"
fi

read -p "Clean up FC-Enail image at: ${mountdir:=/}? [N]" CONFIRM

if [[ ! ${CONFIRM,,} =~ ^y|yes$ ]]; then
  if [ -e $mountdir ]; then
    umount $mountdir
    losetup -d $loopback
  fi
  exit 1
fi

if [ "$mountdir" = "/" ]; then
  mountdir=
fi

echo -e '\n[+] Cleaning up temporary files.'
rm -rvf $mountdir/var/cache/apt/archives/* $mountdir/var/lib/dhcpcd5/* $mountdir/var/log/* \
  $mountdir/var/tmp/* $mountdir/tmp/* \
  $mountdir/home/pi/.bash_history $mountdir/root/.bash_history $mountdir/home/pi/.node_repl_history

if [ $ENAIL -eq 1 ]; then
  echo -e '\n[+] Cleaning up E-Nail files.'
  rm -rvf  $mountdir/etc/systemd/system/multi-user.target.wants/fcenail-localtunnel.service \
    $mountdir/root/.fcenail/.env $mountdir/root/.fcenail/db.json
fi

if [ $NETWORK -eq 1 ]; then
  echo -e '\n[+] Resetting network files.'
  RESULT=$(cat $mountdir/etc/NetworkManager/system-connections/wifi-wlan0.nmconnection \
    | grep -v "mac-address=" \
    | sed -E 's/^ssid=.*$/ssid=Undefined/gi' \
    | sed -E 's/^psk=.*$/psk=1234567890/gi' \
  )
  echo -e "${RESULT}" > $mountdir/etc/NetworkManager/system-connections/wifi-wlan0.nmconnection
  RESULT=$(cat $mountdir/etc/NetworkManager/system-connections/Hotspot.nmconnection \
    | grep -v "mac-address=" \
    | sed -E 's/^ssid=.*$/ssid=FCEnail/gi' \
    | sed -E 's/^psk=.*$/psk=1234567890/gi' \
  )
  echo -e "${RESULT}" > $mountdir/etc/NetworkManager/system-connections/Hotspot.nmconnection
fi

if [[ -e "$IMGFILE" ]]; then
  echo -e "[+] Unmounting image, $IMGFILE\n"
  umount $mountdir
  losetup -d "$loopback"
fi