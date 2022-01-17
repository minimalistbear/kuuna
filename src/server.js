// Constants + Global Variables + Imports
const express = require('express');
const http = require("http");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const open = require('open');

const port = 3000;

/*
 * Setup for express.js routing
 *
 */
app.use('/', express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Routes for kuuna Shooter
app.use('/shooter', express.static(path.join(__dirname, "../public/kuunaShooter")));
app.get("/shooter/local", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaShooter/local/local.html")); } );
app.get("/shooter/remote", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaShooter/remote/remote.html")); } );
app.post("/shooter/remote", (req, res) => {
        var socketID = req.body.socketID;
        open('http://localhost:' + port + '/shooter/stream?clientid=' + socketID,{
            app: {
                name: open.apps.chrome
            }
        });

        res.send('success');
    }
)
app.get("/shooter/stream", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaShooter/stream/stream.html")); } );

// Routes for kuuna Jump'N'Run
app.use('/jumpandrun', express.static(path.join(__dirname, "../public/kuunaJumpAndRun")));
app.get("/jumpandrun/local", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/local/local.html")); } );
app.get("/jumpandrun/remote", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/remote/remote.html")); } );
app.post("/jumpandrun/remote", (req, res) => {
        var socketID = req.body.socketID;
        open('http://localhost:' + port + '/jumpandrun/stream?clientid=' + socketID,{
            app: {
                name: open.apps.chrome
            }
        });

        res.send('success');
    }
)
app.get("/jumpandrun/stream", (req, res) => { res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/stream/stream.html")); } );

/*
 * Setup for socketing
 *
 */
io.sockets.on("error", e => console.log(e));

io.sockets.on("connection", socket => {
    socket.on("call-client", (data) => {
        socket.to(data.to).emit("client-called", {
            offer: data.offer,
            socket: socket.id
        });
    });

    socket.on("answer-server", (data) => {
        socket.to(data.to).emit("server-answered", {
            socket: socket.id,
            answer: data.answer
        });
    });

    socket.on("remote-session-initialised", (data) => {
        socket.to(data.to).emit("remote-session-initialised", { });
    });

    socket.on("disconnect", () => {
        io.sockets.emit("client-session-disconnected", {
            socket: socket.id
        });
    });
});

/*
 * Initialisation
 *
 */
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});