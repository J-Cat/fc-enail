#!/binb/bash

if [ ! -z $1 ]; then
  echo "Usage:  addtag.sh <tag name>"
  exit 1
fi

npm dist-tag add fcenail@$VERSION $1
