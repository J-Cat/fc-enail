#!/bin/bash

cd ~/.fcenail

killall tmate 2> /dev/null
tmate -F > /tmp/.tmatessh &
PID=$!
URL=
while [ "$URL" = "" ]; do
        sleep 5;
        URL=$(cat /tmp/.tmatessh | grep 'ssh session: ssh ' | sed -E 's/^ssh session: ssh (.*)$/\1/gi');
        IFS=@; read -a LINES <<<"$URL"
        LINE0="${LINES[0]}"
        LINE1="${LINES[1]}"
        oled r
        oled +2 "$LINE0@"
        oled +3 "$LINE1"
        oled s
done

wait $PID

EXIT_CODE=$?
echo "Exited with code: $EXIT_CODE"
exit $EXIT_CODE