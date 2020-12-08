#!/bin/bash
SAVE_DIR=$PWD

cd ~/.fcenail

CURRENT_VERSION=$(node -e "console.log(require('/usr/local/lib/nodejs/current/lib/node_modules/fcenail/package.json').version)")
AVAILABLE_VERSION=$(npm view fcenail dist-tags.next)
if [ "$CURRENT_VERSION" != "$AVAILABLE_VERSION" ]; then
  npm install -g fcenail --unsafe
fi

if [ ! -f ~/.fcenail/.env ]; then
  echo 'Generating private key/certificate pair on first launch ...'
  $NODE_PATH/lib/node_modules/fcenail/generate-environment.sh
fi

$NODE_PATH/bin/node $NODE_PATH/lib/node_modules/fcenail/dist/server.js

cd $SAVE_DIR