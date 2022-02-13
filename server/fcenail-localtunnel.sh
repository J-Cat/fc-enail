#!/bin/bash

cd ~/.fcenail

. .env
if [ ! -z "$LOCALTUNNEL_SUBDOMAIN" ]; then
  systemctl disable fcenail-localtunnel.service
fi

NODE_PATH=$(readlink -f /usr/local/lib/nodejs/current)
FCENAIL_PATH="$NODE_PATH/lib/node_modules/fcenail"

$NODE_PATH/bin/node $FCENAIL_PATH/dist/localtunnel.js
EXIT_CODE=$?

echo "Exited with code: $EXIT_CODE"
exit $EXIT_CODE