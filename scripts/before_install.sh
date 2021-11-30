#!/bin/bash

# Download and install node and npm with nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# Check for and create working directory, if needed
DIR="/home/ubuntu/app"
if [ -d "$DIR" ]; then
    echo "$DIR exists"
else
    echo "Creating directory at $DIR"
    mkdir ${DIR}
fi
