#!/bin/bash
OUTDIR=./

PACKAGE_NAME=fc-enail

if [ -f "$OUTDIR/.env" ]; then
  exit 0
fi

openssl genrsa -des3 -passout pass:1234567890abcdefg -out $OUTDIR/$PACKAGE_NAME.pass.key 2048
openssl rsa -passin pass:1234567890abcdefg -in $OUTDIR/$PACKAGE_NAME.pass.key -out $OUTDIR/$PACKAGE_NAME.key
rm $OUTDIR/$PACKAGE_NAME.pass.key
openssl req -new -key $OUTDIR/$PACKAGE_NAME.key -out $OUTDIR/$PACKAGE_NAME.csr -subj "/C=CA/ST=ON/L=Kapuskasing/O=JCat/OU=IT/CN=$PACKAGE_NAME.jcatvapes.com"
openssl x509 -sha256 -req -days 3650 -in $OUTDIR/$PACKAGE_NAME.csr -signkey $OUTDIR/$PACKAGE_NAME.key -out $OUTDIR/$PACKAGE_NAME.crt

API_JWT_PUBLIC_CERT=`cat $OUTDIR/$PACKAGE_NAME.crt | sed -E ':a; N; s/\n/\\\\n/; ta'`
API_JWT_PRIVATE_KEY=`cat $OUTDIR/$PACKAGE_NAME.key | sed -E ':a; N; s/\n/\\\\n/; ta'`

OUTENV="API_PORT=80
API_BASE_ROUTE_PATH=/api
API_JWT_EXPIRES_IN=365d
API_JWT_PRIVATE_KEY=\"$API_JWT_PRIVATE_KEY\"
API_JWT_PUBLIC_CERT=\"$API_JWT_PUBLIC_CERT\"
"
 
rm $OUTDIR/$PACKAGE_NAME.csr $OUTDIR/$PACKAGE_NAME.crt $OUTDIR/$PACKAGE_NAME.key

echo "$OUTENV" > $OUTDIR/.env
echo "Newly generated environment saved to $OUTDIR/.env"
