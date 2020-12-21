#!/bin/bash
if [ "$USER" != "root" ]; then
  echo "FC E-Nail must be un-installed as root!"
  exit 1;
fi

SAVE_DIR=$PWD
NODE_PATH=$(readlink -f /usr/local/lib/nodejs/current)
NODE_MODULES="$NODE_PATH/lib/node_modules"

set -E
systemctl stop fcenail.service
systemctl disable fcenail.service
rm /lib/systemd/system/fcenail.service
# systemctl daemon-reload

if [ -f /usr/local/bin/fcenail ]; then
  rm /usr/local/bin/fcenail
fi

cd $SAVE_DIR
set -e
