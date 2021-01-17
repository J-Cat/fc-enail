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

CURRENT_VERSION=$($NODE_PATH/bin/node -e "console.log(require('$FCENAIL_PATH/package.json').version)")

if [[ $CURRENT_VERSION =~ ^1\.0\.[0-3].*$ ]]; then
  wget -qO- https://github.com/tmate-io/tmate/releases/download/2.4.0/tmate-2.4.0-static-linux-arm32v6.tar.xz | tar xvJf - -C /tmp
  mv /tmp/tmate-2.4.0-static-linux-arm32v6/tmate /usr/local/bin/
  rm -qvf /tmp/tmate-2.4.0*
fi

set -e