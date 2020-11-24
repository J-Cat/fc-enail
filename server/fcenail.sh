#!/bin/bash
if [ ! -f ~/.fcenail ]; then
  mkdir ~/.fcenail
fi

NODE=$(whereis node | sed -E 's/^.*: ([^ ]+).*$/\1/gi')

SAVE_DIR=$PWD
cd ~/.fcenail

if [ ! -f /usr/lib/node_modules/fcenail-server/.env ]; then
  ./generate-environment.sh
fi

$NODE /usr/lib/node_modules/fcenail-server/dist/server.js


cd $SAVE_DIR