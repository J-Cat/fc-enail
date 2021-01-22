#!/bin/bash

cd ~/.fcenail

tmate -F
EXIT_CODE=$?

echo "Exited with code: $EXIT_CODE"
exit $EXIT_CODE