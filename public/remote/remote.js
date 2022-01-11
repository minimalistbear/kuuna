const socket = io.connect(window.location.origin);

const peerConnection = new RTCPeerConnection();
let dataChannel;

const video = document.querySelector("video");

let clientSocketID;

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


video.addEventListener('click', function() {
    video.requestPointerLock = video.requestPointerLock || video.mozRequestPointerLock;
    video.requestPointerLock();
});

peerConnection.ontrack = function ({ streams: [stream] }) {
    video.srcObject = stream;
};

socket.on("remote-session-initialised", () => {
    const compilingmessage = document.getElementById("compilingmessage");
    compilingmessage.remove();
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

function openServer() {
    // window.open(window.location.origin + "/remote/broadcast/?clientid=" + clientSocketID, "_blank").focus();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/remote");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
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
