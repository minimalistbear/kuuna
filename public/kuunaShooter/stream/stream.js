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
// Initial WebRTC call made from remote server streaming session: 'call-client'
// Client listening for 'client-called' and responding with 'answer-server'
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

// Listening for 'server-answered'
socket.on("server-answered", async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

    if (!callCompleted) {
        callClient(data.socket);
        callCompleted = true;
    }
});

// Signal to client to remove 'Loading remote session...' banner:
// Initialised when compilation has completed
// Called from kuunaShooter.UE4.js in function postRunEmscripten() (line 990)
function remoteSessionInitialized() {
    socket.emit("remote-session-initialised", {
        to: clientSocketID
    });
}

// Broadcasted from server, when any client disconnects:
// If disconnected client ID matches own's client, closing Chrome browser tab
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
    // Object always contains attribute 'event'
    // and additionally event specific attributes
    // (i.e. 'key' + 'code' for keystrokes
    //   and 'movementX' + 'movementY' for mouse movements)
    var object = JSON.parse(e.data);

    if(object.event == 'keydown' || object.event == 'keyup') {
        // Keystrokes are dispatched onto whole window
        window.dispatchEvent(new KeyboardEvent(object.event, {
            'key': object.key,
            'code': object.code
        }));
    }
    if(object.event == 'click') {
        // Clicks are dispatched as 'mousedown' events onto canvas
        if(canvas) {
            canvas.dispatchEvent(new Event('mousedown'));
        }
    }
    if(object.event == 'mousemove') {
        // Mouse movements are dispatched onto canvas with movement deltas (i.e. x + y)
        // Event.bubbles is set to 'true' to bubble up event through the DOM tree
        if(canvas) {
            canvas.dispatchEvent(new MouseEvent("mousemove", {
                movementX: object.movementX,
                movementY: object.movementY,
                bubbles: true
            }));
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
        // Stream from canvas element limited to video only as of yet
        const stream = canvas.captureStream();

        stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));

        const params = new URLSearchParams(window.location.search);
        clientSocketID = params.get('clientid');

        // Initialising the initial WebRTC call after canvas stream has been fetched successfully
        callClient(clientSocketID);
    } catch(err) {
        alert(err);
    }
}

// Initialising canvas stream
getMedia();