#!/bin/bash

NEW_HOST=$(ip a | grep -oP '10\.\d+\.\d+\.\d+' | head -n 1)
if [[ -n "$HOST_IP" ]]; then
    export HOST_IP="$HOST_IP:$NEW_IP"
else
    export HOST_IP="$NEW_IP"
fi
echo $NEW_HOST $ALLOWED_HOSTS
 