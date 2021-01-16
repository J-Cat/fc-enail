#!/bin/bash

HELP=0
CLIENT=0
SERVER=0
PUBLISH=0
PACK=0
TAG=

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -h|--help)
    HELP=1
    shift # past argument
    ;;
    -c|--client)
    CLIENT=1
    shift # past argument
    ;;
    -s|--server)
    SERVER=1
    shift # past argument
    ;;
    -p|--publish)
    PUBLISH=1
    shift # past argument
    ;;
    --pack)
    PACK=1
    shift
    ;;
    -t|--tag)
    shift # past argument
    TAG="$1"
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [ $SERVER -eq 1 ]; then
  cd server
  yarn
  yarn build
  cd ..
fi

if [ $CLIENT -eq 1 ]; then
  cd client
  yarn
  yarn build
  cd ..
fi

if [ $PACK -eq 1 ]; then
  cd server
  cp ../README.md .
  yarn pack
  rm ./README.md
  cd ..
fi

if [ $PUBLISH -eq 1 ]; then
  VERSION=$(node -e "console.log(require('./server/package.json').version)")

  cd server
  cp ../README.md .
  yarn publish --tag beta --new-version $VERSION
  rm ./README.md
  cd ..
fi

if [ -n "$TAG" ]; then
  VERSION=$(node -e "console.log(require('./server/package.json').version)")
  npm dist-tag add fcenail@$VERSION $TAG
fi