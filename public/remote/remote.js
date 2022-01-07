let peerConnection;

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection();
    peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
        });
    peerConnection.ontrack = event => {
        video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };
});


socket.on("candidate", (id, candidate) => {
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

socket.on("connect", () => {
    socket.emit("watcher");
});

socket.on("broadcaster", () => {
    socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};