#!/bin/bash
SAVE_DIR=$PWD

cd ~/.fcenail

CURRENT_VERSION=$(node -e "console.log(require('/usr/local/lib/nodejs/current/lib/node_modules/fcenail/package.json').version)")
AVAILABLE_VERSION=$(npm view fcenail dist-tags.next)
if [ "$CURRENT_VERSION" != "$AVAILABLE_VERSION" ]; then
  echo "Installing new version: $AVAILABLE_VERSION."
  npm install -g fcenail@next --unsafe
else
  echo "Current version: $CURRENT_VERSION"
  echo
  echo "No updates available."
  echo
fi

cd $SAVE_DIR