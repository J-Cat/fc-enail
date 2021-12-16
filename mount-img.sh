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

echo -e "Image mounted to: $mountdir\n\n"

echo -e "To unmount run:\n\n\tsudo umount $mountdir\n\tsudo losetup -d $loopback\n"
