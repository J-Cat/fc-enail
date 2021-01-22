#!/bin/bash

if [ "$USER" != "root" ]; then
  echo "oled must be installed as root"
  exit 1;
fi

cp ./oled /usr/local/bin/
cp -r ./fontx /usr/local/lib/
