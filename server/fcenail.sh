#!/bin/bash
SAVE_DIR=$PWD
NODE_MODULES=$(whereis npm | sed -E 's/^.*: ([^ ]+)\/bin\/npm.*$/\1/gi')/lib/node_modules
NODE=$(whereis node | sed -E 's/^.*: ([^ ]+).*$/\1/gi')

cd ~/.fcenail

if [ ! -f ~/.fcenail/.env ]; then
  echo 'Generating private key/certificate pair on first launch ...'
  $NODE_MODULES/fcenail/generate-environment.sh
fi

$NODE $NODE_MODULES/fcenail/dist/server.js

cd $SAVE_DIR