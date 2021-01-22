#!/bin/bash

if [[ $(whoami) != "root" ]]; then
  echo -e "Error: this must be run as root: sudo $0"
  exit
fi

#/usr/local/bin/oled r
#/usr/local/bin/oled s
