// Constants + global variables for connectivity: WebRTC + Sockets
const socket = io.connect(window.location.origin);
const peerConnection = new RTCPeerConnection();
let dataChannel, clientSocketID;
let callCompleted = false;

// HTML canvas element (being set in getMedia())
let canvas;

/*
 * Socketing functions
 *
 */
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

socket.on("server-answered", async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

    if (!callCompleted) {
        callClient(data.socket);
        callCompleted = true;
    }
});

function remoteSessionInitialized() {
    socket.emit("remote-session-initialised", {
        to: clientSocketID
    });
}

socket.on("client-session-disconnected", (data) => {
    if(data.socket == clientSocketID) {
        window.close();
    }
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

/*
 * Handlers for receiving events from client
 * (i.e. keystrokes + mouse clicks + mouse movements)
 *
 */
function handleReceiveMessage(e) {
    var object = JSON.parse(e.data);

    if(object.event == 'keydown' || object.event == 'keyup') {
        window.dispatchEvent(new KeyboardEvent(object.event, {
            'key': object.key,
            'code': object.code
        }));
    }
    if(object.event == 'click') {
        if(canvas) {
            canvas.dispatchEvent(new Event('mousedown'));
        }
    }
}

/*
 * Initialisation
 * of media + connection
 *
 */
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