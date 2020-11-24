#!/bin/bash
SAVE_DIR=$PWD
NODE_MODULES=$(whereis npm | sed -E 's/^.*: ([^ ]+)\/bin\/npm.*$/\1/gi')/lib/node_modules

set -E
systemctl stop fcenail.service
systemctl disable fcenail.service
rm /lib/systemd/system/fcenail.service
systemctl daemon-reload

if [ -f /usr/local/bin/fcenail ]; then
  rm /usr/local/bin/fcenail
fi

cd $SAVE_DIR
set -e
