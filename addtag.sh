#!/binb/bash

if [ ! -z $1 ]; then
  echo "Usage:  addtag.sh <tag name>"
  exit 1
fi

TAG="$1"
VERSION=$(node -e "console.log(require('./package.json').version)")

npm dist-tag add fcenail@$VERSION $TAG
