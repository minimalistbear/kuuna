const peerConnections = {};
const socket = io.connect(window.location.origin);

const canvas = document.querySelector('canvas');
const stream = canvas.captureStream();

socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
    const peerConnection = new RTCPeerConnection();
    peerConnections[id] = peerConnection;

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
        }
    };

    peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("offer", id, peerConnection.localDescription);
        });
});

socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
};

getStream();

function getStream(stream) {
    socket.emit("broadcaster");
}

function handleError(error) {
    console.error("Error: ", error);
}