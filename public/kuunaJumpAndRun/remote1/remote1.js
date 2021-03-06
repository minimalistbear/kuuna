// Constants + global variables for connectivity: WebRTC + Sockets
const socket = io.connect(window.location.origin);
const peerConnection = new RTCPeerConnection();
let dataChannel, clientSocketID;

// HTML video element
const video = document.querySelector("video");

/*
 * Socketing functions
 *
 */
socket.on("connect", () => {
    // Store own socket id to global variable:
    // Will be used in POST XHR to server
    // to open remote server streaming session with 'clientSocketID' as a query parameter
    clientSocketID = socket.id;

    // Initialise remote server streaming session
    openServer();
});

// Initial WebRTC call made from remote server streaming session: 'call-client'
// Listening for 'client-called'
// Responding with 'answer-server'
// Remote server streaming session subsequently listening for 'server-answered'
socket.on("client-called", async (data) => {
    peerConnection.ondatachannel = (e) => {
        dataChannel = e.channel;
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("answer-server", {
        answer,
        to: data.socket
    });
});

// Call to remove 'Loading remote session...' banner:
// Initialised from remote server streaming session when compilation has completed
socket.on("remote-session-initialised", () => {
    const compilingmessage = document.getElementById("compilingmessage");
    compilingmessage.remove();

    showTimeElapsed();
});

// Called after socket has been opened:
// POST XHR (to own URL) with JSON payload containing own ID
// to open remote server streaming session with 'clientSocketID' as a query parameter
function openServer() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/jumpandrun/remote1");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
        const loadTasks = document.getElementById("loadTasks");

        if (xhr.readyState === 4) {
            loadTasks.innerHTML = "Loading remote session...";
        } else {
            loadTasks.innerHTML = "An error has occurred on the server.";
        }
    };

    var data = `{"socketID":"${clientSocketID}"}`;

    xhr.send(data);
}

peerConnection.ontrack = ({streams: [stream]}) => {
    video.srcObject = stream;
};

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

/*
 * Event listeners:
 * keystrokes (i.e. W, A, S, D, Space) +
 * mouse clicks (i.e. mousedown on left button) on video element +
 * mouse movements across video element
 * 
 */
// Keystroke event listeners
window.addEventListener('keydown', (event) => {
    if(event.code == 'KeyW' || event.code == 'KeyA' || event.code == 'KeyS' || event.code == 'KeyD' || event.code == 'Space') {
        let object = {
            event: 'keydown',
            code: event.code,
            key: event.key
        };

        if (dataChannel) dataChannel.send(JSON.stringify(object));
    }
}, false);
window.addEventListener('keyup', (event) => {
    if(event.code == 'KeyW' || event.code == 'KeyA' || event.code == 'KeyS' || event.code == 'KeyD' || event.code == 'Space') {
        let object = {
            event: 'keyup',
            code: event.code,
            key: event.key
        };

        if (dataChannel) dataChannel.send(JSON.stringify(object));
    }
}, false);

// (Left button) Mouse click (onto video element) event listener
video.addEventListener('mousedown', (event) => {
    if(!pointerLocked) {
        video.requestPointerLock = video.requestPointerLock || video.mozRequestPointerLock;
        video.requestPointerLock();
    }
    
    if(event.button == 0) {
        let object = {
            event: 'click'
        };

        if (dataChannel) dataChannel.send(JSON.stringify(object));
    }
});

// Mouse movement (across video element) event listener
video.addEventListener("mousemove", (event) => {
    let object = {
        event: 'mousemove',
        movementX: event.movementX,
        movementY: event.movementY
    }

    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);

// Pointer lock change (in video element) event listeners
// This and above listeners are designed to best emulate original behaviour of locally running app instance
var pointerLocked = false;
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);
function pointerLockChange() {
    if (document.pointerLockElement === video || document.mozPointerLockElement === video) {
        pointerLocked = true;
    } else {
        pointerLocked = false;
    }
}

/*
 * Functions and variables
 * for touch controls
 *
 */
var touchControlsEnabled = false;
var touchControls = document.getElementsByClassName("touchControls")
var touchControlSwitch = document.querySelector("input[id=touchControlsSwitch]");
touchControlSwitch.addEventListener('change', () => {
    touchControlsEnabled = touchControlSwitch.checked;
    touchControls[0].hidden = touchControls[1].hidden = !touchControlsEnabled;
})

var touchButtonW = document.getElementById("touchButtonW");
var touchButtonA = document.getElementById("touchButtonA");
var touchButtonS = document.getElementById("touchButtonS");
var touchButtonD = document.getElementById("touchButtonD");
var touchButtonSpace = document.getElementById("touchButtonSpace");

touchButtonW.addEventListener("touchstart", () => {
    let object = { event: 'keydown', code: 'KeyW', key: 'w' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonW.addEventListener("touchend", () => {
    let object = { event: 'keyup', code: 'KeyW', key: 'w' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonA.addEventListener("touchstart", () => {
    let object = { event: 'keydown', code: 'KeyA', key: 'a' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonA.addEventListener("touchend", () => {
    let object = { event: 'keyup', code: 'KeyA', key: 'a' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonS.addEventListener("touchstart", () => {
    let object = { event: 'keydown', code: 'KeyS', key: 's' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonS.addEventListener("touchend", () => {
    let object = { event: 'keyup', code: 'KeyS', key: 's' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonD.addEventListener("touchstart", () => {
    let object = { event: 'keydown', code: 'KeyD', key: 'd' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonD.addEventListener("touchend", () => {
    let object = { event: 'keyup', code: 'KeyD', key: 'd' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonSpace.addEventListener("touchstart", () => {
    let object = { event: 'keydown', code: 'Space', key: ' ' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);
touchButtonSpace.addEventListener("touchend", () => {
    let object = { event: 'keyup', code: 'Space', key: ' ' };
    if (dataChannel) dataChannel.send(JSON.stringify(object));
}, false);

/*
 * Functions and variables
 * for measuring load time
 *
 */
var now = new Date();

function showTimeElapsed() {
    var msElapsed = new Date() - now;

    console.log("load time for remote kuuna Jump'N'Run: " + msElapsed + "ms");
}

/*
 * Functions and variables
 * for monitoring incoming WebRTC connection
 *
 */
var statsEnabled = false;
var statsSwitch = document.querySelector("input[id=statsSwitch]");
statsSwitch.addEventListener('change', () => {
    statsEnabled = statsSwitch.checked;
    if(statsEnabled) stats();
})

function stats(){
    if (peerConnection) {
        peerConnection
            .getStats(null)
            .then(showRemoteStats);
    }

    if(statsEnabled) setTimeout(stats, 1000);
}

var bytesPrev = 0;
var timestampPrev = 0;
function showRemoteStats(results) {
    results.forEach(report => {
        if(report.type === 'inbound-rtp') {

            let bitrate, now = report.timestamp;
            const bytes = report.bytesReceived;
            if (timestampPrev) {
                bitrate = 8 * (bytes - bytesPrev) / (now - timestampPrev);
                bitrate = Math.floor(bitrate);
            }
            bytesPrev = bytes;
            timestampPrev = now;

            if (bitrate) {
                bitrate += ' kbits/sec';
                console.log(new Date().toString() + ": " + dumpStats(report) + " bitrate: " + bitrate);
            } else {
                console.log(new Date().toString() + ": " + dumpStats(report));
            }
        }
        if(report.type === 'candidate-pair') {
            console.log(new Date().toString() + ": " + dumpStats(report));
        }
    });
}

function dumpStats(res) {
    let statsString = '';

    statsString += `report type: ${res.type} `;
    statsString += `id: ${res.id} `;
    statsString += `time: ${res.timestamp} `;
    Object.keys(res).forEach(k => {
        if (k !== 'timestamp' && k !== 'type' && k !== 'id') {
            if (typeof res[k] === 'object') {
                statsString += `${k}: ${JSON.stringify(res[k])} `;
            } else {
                statsString += `${k}: ${res[k]} `;
            }
        }
    });

    return statsString;
}