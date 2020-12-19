#!/bin/bash
SAVE_DIR=$PWD

cd ~/.fcenail

CURRENT_VERSION=$(node -e "console.log(require('/usr/local/lib/nodejs/current/lib/node_modules/fcenail/package.json').version)")
AVAILABLE_VERSION=$(npm view fcenail dist-tags.next)
if [ "$CURRENT_VERSION" != "$AVAILABLE_VERSION" ]; then
  npm install -g fcenail@next --unsafe
fi

cd $SAVE_DIR