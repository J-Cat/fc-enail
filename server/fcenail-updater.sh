#!/bin/bash
set -E

if [ "$USER" != "root" ]; then
  echo "FC E-Nail Updater must be run as root!"
  exit 1;
fi

SAVE_DIR=$PWD

cd ~/.fcenail

. /etc/systemd/fcenail.conf
FCENAIL_DIST_TAG=${FCENAIL_DIST_TAG:="latest"}

CURRENT_VERSION=$(node -e "console.log(require('/usr/local/lib/nodejs/current/lib/node_modules/fcenail/package.json').version)")
AVAILABLE_VERSION=$(npm view fcenail dist-tags.next)
if [ "$CURRENT_VERSION" != "$AVAILABLE_VERSION" ]; then
  echo "Installing new version: $AVAILABLE_VERSION."
  npm install -g fcenail@$FCENAIL_DIST_TAG --unsafe
else
  echo "Current version: $CURRENT_VERSION"
  echo
  echo "No updates available."
  echo
fi

cd $SAVE_DIR
set -e