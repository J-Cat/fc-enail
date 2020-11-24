#!/bin/bash
SAVE_DIR=$PWD
NODE_MODULES=$(whereis npm | sed -E 's/^.*: ([^ ]+)\/bin\/npm.*$/\1/gi')/lib/node_modules

if [ ! -f /lib/systemd/system/fcenail.service ]; then
  cp $NODE_MODULES/fcenail/fcenail.service /lib/systemd/system
  systemctl enable fcenail.service
  systemctl daemon-reload
fi

if [ ! -d ~/.fcenail ]; then
  mkdir ~/.fcenail
fi

cd ~/.fcenail

if [ -f /usr/local/bin/fcenail ]; then
  rm /usr/local/bin/fcenail
fi
ln -s $NODE_MODULES/fcenail/fcenail.sh /usr/local/bin/fcenail

systemctl start fcenail.service

cd $SAVE_DIR
