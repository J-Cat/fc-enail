#!/bin/bash
if [ "$USER" != "root" ]; then
  exit 0;
fi

SAVE_DIR=$PWD
NODE_PATH=$(whereis npm | sed -E 's/^.*: ([^ ]+)\/bin\/npm.*$/\1/gi')
NODE_MODULES="$NODE_PATH/lib/node_modules"

echo "NODE_PATH=$NODE_PATH" > /etc/systemd/fcenail.conf

if [ ! -f /lib/systemd/system/fcenail.service ]; then
  cp $NODE_MODULES/fcenail/fcenail.service /lib/systemd/system
  systemctl enable fcenail.service
  systemctl daemon-reload
fi

if [ ! -f /lib/systemd/system/fcenail-update.service ]; then
  cp $NODE_MODULES/fcenail/fcenail-update.service /lib/systemd/system
  if [ ! -f /usr/local/bin/fcenail-updater ]; then
    ln -s $NODE_MODULES/fcenail/fcenail-updater.sh /usr/local/bin/fcenail-updater
  fi
  systemctl enable fcenail-update.service
  systemctl daemon-reload
fi

if [ ! -d ~/.fcenail ]; then
  mkdir ~/.fcenail
  ln -s $NODE_MODULES/fcenail/sounds ~/.fcenail/sounds
fi

cd ~/.fcenail

if [ -f /usr/local/bin/fcenail ]; then
  rm /usr/local/bin/fcenail
fi
ln -s $NODE_MODULES/fcenail/fcenail.sh /usr/local/bin/fcenail

systemctl start fcenail.service
systemctl start fcenail-update.service

cd $SAVE_DIR
