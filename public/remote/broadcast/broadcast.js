const socket = io.connect(window.location.origin);
const peerConnection = new RTCPeerConnection();

let clientSocketID;

let callCompleted = false;

async function callClient(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-client", {
        offer,
        to: socketId
    });
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
        const canvas = document.querySelector('canvas');
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
    socket.emit("remote-session-initialized", {
        to: clientSocketID
    });
}

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};
