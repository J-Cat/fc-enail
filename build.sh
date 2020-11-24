#!/bin/bash

cd server
yarn
yarn build

cd ../client
yarn
yarn build

cd ../server
cp ../README.md .

yarn pack
#yarn publish --tag beta

rm ./README.md
cd ..
