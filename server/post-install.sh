#!/bin/bash
set -E
if [ "$USER" != "root" ]; then
  echo "FC E-Nail must be installed as root!"
  exit 0;
fi

SAVE_DIR=$PWD
NODE_PATH=$(readlink -f /usr/local/lib/nodejs/current)
NODE_MODULES="$NODE_PATH/lib/node_modules"
FCENAIL_PATH="$NODE_PATH/lib/node_modules/fcenail"
STARTLT=0

if [ ! -f /etc/systemd/fcenail.conf ]; then
  echo "NODE_PATH=$NODE_PATH" > /etc/systemd/fcenail.conf
  echo "FCENAIL_DIST_TAG=latest" >> /etc/systemd/fcenail.conf
fi

if [ ! -f /lib/systemd/system/fcenail.service ]; then
  cp $NODE_MODULES/fcenail/fcenail.service /lib/systemd/system
  systemctl enable fcenail.service
  systemctl daemon-reload
fi

cp -b $NODE_MODULES/fcenail/fcenail-localtunnel.sh /usr/local/bin/fcenail-localtunnel

if [ ! -f /lib/systemd/system/fcenail-localtunnel.service ]; then
  cp $NODE_MODULES/fcenail/fcenail-localtunnel.service /lib/systemd/system
  . /root/.fcenail/.env
  if [ -n "$LOCALTUNNEL_SUBDOMAIN" ]; then
    systemctl enable fcenail-localtunnel.service
    STARTLT=1
  fi
  systemctl daemon-reload
fi

cp -b $NODE_MODULES/fcenail/fcenail-remotesupport.sh /usr/local/bin/fcenail-remotesupport

if [ ! -f /lib/systemd/system/fcenail-remotesupport.service ]; then
  cp $NODE_MODULES/fcenail/fcenail-remotesupport.service /lib/systemd/system
  systemctl disable fcenail-remotesupport.service
  systemctl daemon-reload
fi

cp -b $NODE_MODULES/fcenail/fcenail-updater.sh /usr/local/bin/fcenail-updater

if [ ! -f /lib/systemd/system/fcenail-update.service ]; then
  cp $NODE_MODULES/fcenail/fcenail-update.service /lib/systemd/system
  systemctl enable fcenail-update.service
  systemctl daemon-reload
fi

if [ ! -f /etc/systemd/system/fcenail-update.timer ]; then
  cp $NODE_MODULES/fcenail/fcenail-update.timer /etc/systemd/system
  systemctl enable fcenail-update.timer
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
if [ $STARTLT -eq 1 ]; then
  systemctl start fcenail-localtunnel.service
fi
cd $SAVE_DIR
set -e