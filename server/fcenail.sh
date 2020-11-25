#!/bin/bash
SAVE_DIR=$PWD

cd ~/.fcenail

if [ ! -f ~/.fcenail/.env ]; then
  echo 'Generating private key/certificate pair on first launch ...'
  $NODE_PATH/lib/node_modules/fcenail/generate-environment.sh
fi

$NODE_PATH/bin/node $NODE_PATH/lib/node_modules/fcenail/dist/server.js

cd $SAVE_DIR