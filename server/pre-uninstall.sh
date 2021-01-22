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
systemctl stop fcenail-localtunnel.service
systemctl disable fcenail-localtunnel.service
rm /lib/systemd/system/fcenail-localtunnel.service
systemctl enable fcenail-remotesupport.service
systemctl start fcenail-remotesupport.service
# systemctl daemon-reload

if [ -f /usr/local/bin/fcenail ]; then
  rm /usr/local/bin/fcenail
fi

if [ -f /usr/local/bin/fcenail-localtunnel ]; then
  rm /usr/local/bin/fcenail-localtunnel
fi

cd $SAVE_DIR
set -e
