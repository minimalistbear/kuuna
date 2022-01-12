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
    clientSocketID = socket.id;
});

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

socket.on("remote-session-initialised", () => {
    const compilingmessage = document.getElementById("compilingmessage");
    compilingmessage.remove();
});

function openServer() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/remote");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
        const loadTasks = document.getElementById("loadTasks");

        if (xhr.readyState === 4) {
            loadTasks.innerHTML = "Loading remote session...";
        } else {
            loadTasks.innerHTML = "An error has occurred on the server.";
        }

        const openRemoteSessionBtn = document.getElementById("openRemoteSessionBtn");
        if(openRemoteSessionBtn) openRemoteSessionBtn.remove();
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
document.addEventListener('keydown', (event) => {
    if(event.code == 'KeyW' || event.code == 'KeyA' || event.code == 'KeyS' || event.code == 'KeyD' || event.code == 'Space') {
        let object = {
            event: 'keydown',
            code: event.code,
            key: event.key
        };

        if (dataChannel) dataChannel.send(JSON.stringify(object));
    }
}, false);

document.addEventListener('keyup', (event) => {
    if(event.code == 'KeyW' || event.code == 'KeyA' || event.code == 'KeyS' || event.code == 'KeyD' || event.code == 'Space') {
        let object = {
            event: 'keyup',
            code: event.code,
            key: event.key
        };

        if (dataChannel) dataChannel.send(JSON.stringify(object));
    }
}, false);

var pointerLocked = false;
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);

function pointerLockChange() {
    if (document.pointerLockElement === video || document.mozPointerLockElement === video) {
        video.addEventListener("mousemove", mouseMoveEvent, false);

        pointerLocked = true;
    } else {
        video.removeEventListener("mousemove", mouseMoveEvent, false);

        pointerLocked = false;
    }
}

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

function mouseMoveEvent() {
    // TODO
}
