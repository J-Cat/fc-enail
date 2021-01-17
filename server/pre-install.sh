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
  rm -rvf /tmp/tmate-2.4.0*
  echo -e 'set tmate-api-key "tmk-dYVf59tN0D5zWARksnkCWdMNcJ"\nset tmate-authorized-keys "/home/pi/.ssh/authorized_keys"' > /home/pi/.tmate.conf
  ln -s /home/pi/.tmate.conf /root/.tmate.conf
fi

set -e