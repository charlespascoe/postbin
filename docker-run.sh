#!/bin/bash

read -p 'Tag: ' TAG
read -p 'Port: ' PORT
read -p 'Name (postbin): ' NAME

if [[ -z "$NAME" ]]; then
    NAME='postbin'
fi

read -p 'Config path: ' CONFIG
read -p 'htpasswd path: ' HTPASSWD

docker run -itd --name "$NAME" -p "127.0.0.1:$PORT:8080" -v "$CONFIG:/etc/config.json" -v "$HTPASSWD:/home/app/postbin/htpasswd" "postbin:$TAG"
