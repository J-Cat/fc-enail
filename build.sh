#!/bin/bash

cd server
yarn
yarn build

cd ../client
yarn
yarn build

cd ../server
rm -f -R dist/ src/

yarn pack
yarn publish --tag beta
