#!/bin/bash

HELP=0
CLIENT=0
SERVER=0
PUBLISH=0
PACK=0
NEXT=0
LATEST=0

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
    -n|--next)
    shift # past argument
    NEXT=1
    ;;
    -l|--latest)
    shift # past argument
    LATEST=1
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [ $HELP -eq 1 ]; then
  echo -e "Usage:\n"
  echo -e "\t./build.sh [-h|--help] [-c|--client] [-s|--server] [-p|--publish] [--pack] [-n|--next] [-l|--latest]\n\n"
  exit 0
fi

if [ $CLIENT -eq 1 ]; then
  cd client
  yarn
  yarn build
  cd ..
fi

if [ $SERVER -eq 1 ]; then
  cd server
  yarn
  yarn build
  cd ..
  if [ -d "./server/dist/client" ]; then
    rm -f -R ./server/dist/client
  fi
  mkdir ./server/dist/client
  cp -R ./client/build/* ./server/dist/client/  
  if [ -d "./server/dist/oled" ]; then
    rm -f -R ./server/dist/oled
  fi
  mkdir ./server/dist/oled
  cp -R ./oled/* ./server/dist/oled/
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

if [ $NEXT -eq 1 ]; then
  VERSION=$(node -e "console.log(require('./server/package.json').version)")
  npm dist-tag add fcenail@$VERSION next
fi

if [ $LATEST -eq 1 ]; then
  VERSION=$(node -e "console.log(require('./server/package.json').version)")
  npm dist-tag add fcenail@$VERSION latest
fi