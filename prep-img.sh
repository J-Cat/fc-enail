#!/bin/bash
if [[ -z "$1" ]]; then
  echo -e "usage: sudo $0 <file.img>\n"
  exit
fi

IMGFILE="$1"

if [[ $(whoami) != "root" ]]; then
  echo -e "error: this must be run as root: sudo $0 <file.img>"
  exit
fi


if [[ ! -e "$IMGFILE" ]]; then
  echo -e "error: no such file\n"
  exit
fi

orig_img_size=$(stat --printf="%s" "$IMGFILE")

part_info=$(parted -m "$IMGFILE" unit B print)
echo -e "\n[+] partition info"
echo "----------------------------------------------"
echo -e "$part_info\n"

part_num=$(echo "$part_info" | grep ext4 | cut -d':' -f1)
part_start=$(echo "$part_info" | grep ext4 | cut -d':' -f2 | sed 's/B//g')
part_size=$(echo "$part_info" | grep ext4 | cut -d':' -f4 | sed 's/B//g')

echo -e "[+] setting up loopback\n"
loopback=$(losetup -f --show -o "$part_start" "$IMGFILE")

echo -e "[+] Mounting loopback and cleaning up image for cloning\n"
mountdir=$(mktemp -d)
mount "$loopback" "$mountdir"
rm -rvf $mountdir/var/cache/apt/archives/* $mountdir/var/lib/dhcpcd5/* $mountdir/var/log/* \
  $mountdir/var/tmp/* $mountdir/tmp/* $mountdir/etc/ssh/ssh_host_* $mountdir/etc/machine-id \
  $mountdir/root/.fcenail/.env $mountdir/root/.fcenail/db.json \
  $mountdir/home/pi/.bash_history $mountdir/root/.bash_history $mountdir/home/pi/.node_repl_history
touch $mountdir/etc/machine-id
cat $mountdir/etc/NetworkManager/system-connections/wifi-wlan0.nmconnection \
  | grep -v "mac-address=" \
  | sed -E 's/^ssid=.*$/ssid=Undefined/gi' \
  | sed -E 's/^psk=.*$/psk=1234567890/gi' \
> $mountdir/etc/NetworkManager/system-connections/wifi-wlan0.nmconnection
cat $mountdir/etc/NetworkManager/system-connections/Hotspot.nmconnection \
  | grep -v "mac-address=" \
  | sed -E 's/^ssid=.*$/ssid=FCEnail/gi' \
  | sed -E 's/^psk=.*$/psk=1234567890/gi' \
> $mountdir/etc/NetworkManager/system-connections/Hotspot.nmconnection
mv $mountdir/etc/rc.local $mountdir/etc/rc.local.bak
echo "#!/bin/sh

raspi-config --expand-rootfs
ssh-keygen -A
cp -f /etc/rc.local.bak /etc/rc.local
rm /etc/rc.local.bak
exit 0" > $mountdir/etc/rc.local
chmod a+x $mountdir/etc/rc.local
umount "$mountdir"

echo "[+] checking loopback file system"
echo "----------------------------------------------"
e2fsck -f "$loopback"

echo -e "\n[+] determining minimum partition size"
min_size=$(resize2fs -P "$loopback" | cut -d':' -f2)

# next line is optional: comment out to remove 1% overhead to fs size
min_size=$(($min_size + $min_size / 100))

if [[ $part_size -lt $(($min_size * 4096 + 1048576)) ]]; then
  echo -e "\n[!] halt: image already as small as possible.\n"
  losetup -d "$loopback"
  exit
fi

echo -e "\n[+] resizing loopback fs (may take a while)"
echo "----------------------------------------------"
resize2fs -p "$loopback" "$min_size"
sleep 1

echo -e "[+] detaching loopback\n"
losetup -d "$loopback"

part_new_size=$(($min_size * 4096))
part_new_end=$(($part_start + $part_new_size))

echo -e "[+] adjusting partitions\n"
parted "$IMGFILE" rm "$part_num"
parted "$IMGFILE" unit B mkpart primary $part_start $part_new_end

free_space_start=$(parted -m "$IMGFILE" unit B print free | tail -1 | cut -d':' -f2 | sed 's/B//g')

echo -e "[+] truncating image\n"
truncate -s $free_space_start "$IMGFILE"

new_img_size=$(stat --printf="%s" "$IMGFILE")
bytes_saved=$(($orig_img_size - $new_img_size))
echo -e "DONE: reduced "$IMGFILE" by $(($bytes_saved/1024))KiB ($((bytes_saved/1024/1024))MB)\n"
