const express = require('express');
const http = require("http");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const open = require('open');

const port = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

app.get("/local", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/local/local.html")); 
    }
);

app.get("/remote", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/remote/remote.html")); 
    }
);
app.post("/remote", (req, res) => {
        var socketID = req.body.socketID;
        open('http://localhost:' + port + '/stream?clientid=' + socketID,{
            app: {
                name: open.apps.chrome
            }
        });

        res.send('success');
    }
)
app.get("/stream", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/stream/stream.html"));
    }
);

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

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});