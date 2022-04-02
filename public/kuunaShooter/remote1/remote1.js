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
    xhr.open("POST", "/shooter/remote1");

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
 * for measuring load time
 *
 */
var now = new Date();

function showTimeElapsed() {
    var msElapsed = new Date() - now;

    console.log("load time for remote kuuna Shooter: " + msElapsed + "ms");
}