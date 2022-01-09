const express = require('express');
const http = require("http");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const port = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.get("/local", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/local/local.html")); 
    }
);
app.get("/remote", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/remote/remote.html")); 
    }
);
app.get("/remote/broadcast", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/remote/broadcast/broadcast.html")); 
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
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});