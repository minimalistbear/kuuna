const express = require('express');
const http = require("http");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const port = 3000;

let broadcaster;

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
    socket.on("broadcaster", () => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster");
    });

    socket.on("watcher", () => {
        socket.to(broadcaster).emit("watcher", socket.id);
    });
    
    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });

    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });

    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });
    
    socket.on("disconnect", () => {
        socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});