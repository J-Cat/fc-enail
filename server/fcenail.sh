#!/bin/bash
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

INSTALL=
case $key in
    -i|--install)
    INSTALL=true
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

if [ "$INSTALL" = "true" ]; then
  if [ ! -f /lib/systemd/system/fcenail.service ]; then
    cp /usr/lib/node_modules/fcenail-server/fcenail.service /lib/systemd/system
    systemctl enable fcenail.service
  fi

  if [ ! -d ~/.fcenail ]; then
    mkdir ~/.fcenail
  fi

  cd ~/.fcenail

  if [ ! -f ~/.fcenail/.env ]; then
    /usr/lib/node_modules/fcenail-server/generate-environment.sh
  fi

  systemctl start fcenail.service
  exit 0
fi

NODE=$(whereis node | sed -E 's/^.*: ([^ ]+).*$/\1/gi')
$NODE /usr/lib/node_modules/fcenail-server/dist/server.js

cd $SAVE_DIR