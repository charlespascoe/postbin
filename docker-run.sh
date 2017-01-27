#!/bin/bash

TAG=$1
PORT=$2
NAME=$3
CONFIG=$4

docker run -itd --name "$NAME" -p "127.0.0.1:$PORT:8080" -v "$CONFIG:/etc/config.json" "postbin:$TAG"
