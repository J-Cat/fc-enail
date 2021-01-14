#!/bin/bash

cd ~/.fcenail

NODE_PATH=$(readlink -f /usr/local/lib/nodejs/current)
FCENAIL_PATH="$NODE_PATH/lib/node_modules/fcenail"

$NODE_PATH/bin/node $FCENAIL_PATH/dist/localtunnel.js