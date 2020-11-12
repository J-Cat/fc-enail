#!/bin/bash
if [ ! -d "../server/dist" ]; then
  echo "Server build directory does not exist."
  exit 1
fi

if [ -d "../server/dist/client" ]; then
  rm -f -R ../server/dist/client
fi
mkdir ../server/dist/client
cp -R build/* ../server/dist/client/