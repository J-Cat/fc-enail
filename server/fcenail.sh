#!/bin/bash

if [ "$USER" != "root" ]; then
  echo "FC E-Nail must be run as root!"
  exit 1;
fi

VERSION=0
POSITIONAL=()

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -v|--version)
    VERSION=1
    shift # past argument
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

SAVE_DIR=$PWD
cd ~/.fcenail

NODE_PATH=$(readlink -f /usr/local/lib/nodejs/current)
FCENAIL_PATH="$NODE_PATH/lib/node_modules/fcenail"

if [ $VERSION -eq 1 ]; then
  CURRENT_VERSION=$($NODE_PATH/bin/node -e "console.log(require('$FCENAIL_PATH/package.json').version)")
  echo $CURRENT_VERSION
  exit 0
fi

if [ ! -f ~/.fcenail/.env ]; then
  echo 'Generating private key/certificate pair on first launch ...'
  $FCENAIL_PATH/generate-environment.sh
fi

$NODE_PATH/bin/node $FCENAIL_PATH/dist/server.js

cd $SAVE_DIR