#!/bin/bash

cd server
yarn
yarn build

cd ../client
yarn
yarn build

cd ../server
cp ../README.md .

read -p "Generate package file (F), publish to NPM (P), or skip (N) [N] " PUBLISH

PUBLISH=${PUBLISH:="N"}
case $PUBLISH in
  F | f)
    yarn pack
  ;;
  P | p)
    VERSION=$(node -e "console.log(require('./package.json').version)")
    yarn publish --tag beta --new-version $VERSION
  ;;
esac

rm ./README.md
cd ..
