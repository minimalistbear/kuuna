const socket = io.connect(window.location.origin);

const peerConnection = new RTCPeerConnection();
let dataChannel;

let clientSocketID, canvas;

let callCompleted = false;

async function callClient(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    dataChannel = peerConnection.createDataChannel("sendChannel");
    dataChannel.onmessage = handleReceiveMessage;

    socket.emit("call-client", {
        offer,
        to: socketId
    });
}

function handleReceiveMessage(e) {
    var object = JSON.parse(e.data);

    if(object.event == 'keydown' || object.event == 'keyup') {
        window.dispatchEvent(new KeyboardEvent(object.event, {
            'key': object.key,
            'code': object.code
        }));
    }
    if(object.event == 'click') {
        if(canvas) canvas.click();
    }
}

socket.on("server-answered", async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

    if (!callCompleted) {
        callClient(data.socket);
        callCompleted = true;
    }
});

async function getMedia() {
    try {
        canvas = document.querySelector('canvas');
        const stream = canvas.captureStream();

        stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));

        const params = new URLSearchParams(window.location.search);
        clientSocketID = params.get('clientid');

        callClient(clientSocketID);
    } catch(err) {
        alert(err);
    }
}

getMedia();

function remoteSessionInitialized() {
    socket.emit("remote-session-initialised", {
        to: clientSocketID
    });
}

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};
