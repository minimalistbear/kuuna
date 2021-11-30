#!/bin/bash

# Give permissions to working directory
sudo chmod -R 777 /home/ubuntu/app

# Navigate to working directory
cd /home/ubuntu/app

# Add npm and node to PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install node modules
npm install

# Start application in the background
node src/server.js > app.out.log 2> app.err.log < /dev/null &