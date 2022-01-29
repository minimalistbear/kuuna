# kuuna
Evaluation of WebAssembly as a portable compilation target for delivery of complex applications to web browsers

## Setup
1. `npm install`
2. `npm start`
3. Visit http://localhost:3000/

## Docker
### Run as Docker container
1. `docker build . -t minimalistbear/kuuna`
2. `docker run --name kuuna_app -p 3000:3000 -d minimalistbear/kuuna`
3. Visit http://localhost:3000/
### Remove Docker container and image
1. `docker container stop kuuna_app`
2. `docker container rm kuuna_app`
3. `docker image rm minimalistbear/kuuna`

## Dependencies
* express 4.17.1
* bootstrap 5.0.2
* stats.js r17
* socket.io 4.0.1
* open 8.4.0
* multer 1.4.4
* chrome-launcher 0.15.0