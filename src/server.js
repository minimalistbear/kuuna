// Constants + Global Variables + Imports
const express = require('express');
const http = require("http");
const path = require('path');
const multer  = require('multer');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const open = require('open');
const { spawn } = require('child_process');
const chromeLauncher = require('chrome-launcher');
const inkjet = require('inkjet');

const port = 3000;

/*
 * Setup for express.js routing
 *
 */
app.use('/', express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Routes for kuuna Shooter
app.use('/shooter', express.static(path.join(__dirname, "../public/kuunaShooter")));
app.get("/shooter/local", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaShooter/local/local.html"));
    console.log(new Date().toString() + ": local version of kuuna shooter requested");
});
app.get("/shooter/remote1", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaShooter/remote1/remote1.html"));
    console.log(new Date().toString() + ": remote (full Chrome) version of kuuna shooter requested");
});
app.get("/shooter/remote2", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaShooter/remote2/remote2.html"));
    console.log(new Date().toString() + ": remote (Chrome in xvfb) version of kuuna shooter requested");
});
app.post("/shooter/remote1", (req, res) => {
        var socketID = req.body.socketID;
        var link = 'http://localhost:' + port + '/shooter/stream?clientid=' + socketID;

        open(link,{
            app: {
                name: open.apps.chrome
            }
        });

        res.send('success');
    }
)
app.post("/shooter/remote2", (req, res) => {
        var socketID = req.body.socketID;
        var link = 'http://localhost:' + port + '/shooter/stream?clientid=' + socketID;

        const xvfbRun = spawn('xvfb-run', ['google-chrome', link]);

        xvfbRun.stdout.on('data', (data) => {
            console.log(new Date().toString() + `: xvfb for ${socketID} (stdout): ${data}`);
        });
        
        xvfbRun.stderr.on('data', (data) => {
            console.error(new Date().toString() + `: xvfb for ${socketID} (stderr: ${data}`);
        });
        
        xvfbRun.on('close', (code) => {
            console.log(new Date().toString() + `: xvfb for ${socketID} (stdout): exit with code ${code}`);
        });

        res.send('success');
    }
)
app.get("/shooter/stream", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaShooter/stream/stream.html"));
    console.log(new Date().toString() + ": stream version of kuuna shooter requested");
});

// Routes for kuuna Jump'N'Run
app.use('/jumpandrun', express.static(path.join(__dirname, "../public/kuunaJumpAndRun")));
app.get("/jumpandrun/local", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/local/local.html"));
    console.log(new Date().toString() + ": local version of kuuna jump'n'run requested");
});
app.get("/jumpandrun/remote1", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/remote1/remote1.html"));
    console.log(new Date().toString() + ": remote (full Chrome) version of kuuna jump'n'run requested");
});
app.get("/jumpandrun/remote2", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/remote2/remote2.html"));
    console.log(new Date().toString() + ": remote (headless Chrome) version of kuuna jump'n'run requested");
});
app.post("/jumpandrun/remote1", (req, res) => {
        var socketID = req.body.socketID;
        var link = 'http://localhost:' + port + '/jumpandrun/stream?clientid=' + socketID;

        open(link, {
            app: {
                name: open.apps.chrome
            }
        });

        res.send('success');
    }
)
app.post("/jumpandrun/remote2", (req, res) => {
        var socketID = req.body.socketID;
        var link = 'http://localhost:' + port + '/jumpandrun/stream?clientid=' + socketID;

        chromeLauncher.launch({
            startingUrl: link,
            chromeFlags: ['--headless']
        }).then(chrome => {
            console.log(new Date().toString() + `: remote chrome session for ${socketID} debugging on port ${chrome.port}`);
        });

        res.send('success');
    }
)
app.get("/jumpandrun/stream", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/kuunaJumpAndRun/stream/stream.html"));
    console.log(new Date().toString() + ": stream version of kuuna jump'n'run requested");
});

// Routes for n-th Fibonacci no.
app.get("/fibonacci", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/fibonacci/nthfibno.html"));
    console.log(new Date().toString() + ": app for n-th Fibonacci no. requested");
});
app.post("/fibonacci", (req, res) => {
    var n = req.body.n;
    var x;
    if(nthfibno) x = nthfibno(n);

    console.log(new Date().toString() + ": calculated nthFibNo(" + n + ") = " + x);
    
    res.send(x.toString());
});

// Route for Handwriting Recognition
app.get("/handwriting", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/handwriting/handwriting.html"));
    console.log(new Date().toString() + ": app for handwriting recognition requested");
});

var upload = multer({ dest: __dirname + '/../uploads/' });
var type = upload.single('canvasUpload');

app.post("/handwriting", type, (req, res) => {
    var recognisedString = "";
    var responseSent = false;

    // TODO: Temporary solution with tesseract locally
    const tesseractRun = spawn('tesseract', [req.file.path, 'stdout']);

    tesseractRun.stdout.on('data', (data) => {
        recognisedString = data;
        console.log(new Date().toString() + ": recognised with readCharacters(" + req.file.filename + ") = " + recognisedString);
        if(!responseSent) {
            res.send(recognisedString.toString());
            responseSent = true;
        }

        console.log(new Date().toString() + `: tesseract for ${req.file.filename} (stdout): ${data}`);
    });
    
    tesseractRun.stderr.on('data', (data) => {
        console.error(new Date().toString() + `: tesseract for ${req.file.filename} (stderr): ${data}`);

        if(!responseSent && data.toString().startsWith("Empty page!!")) {
            res.send(recognisedString.toString());
            responseSent = true;
        }
    });
    
    tesseractRun.on('close', (code) => {
        console.log(new Date().toString() + `: tesseract for ${req.file.filename} (stdout): exit with code ${code}`);

        if(!responseSent) {
            res.send(recognisedString.toString());
            responseSent = true;
        }
    });
});

// Routes for WebP encoder
app.get("/webp", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/webp/encoder.html"));
    console.log(new Date().toString() + ": app for WebP encoder requested");
});

var upload = multer({ dest: __dirname + '/../uploads2/' });
var type2 = upload.single('imageUpload');

app.post("/webp", type2, (req, res) => {
    const buffer = fs.readFileSync(req.file.path);
    inkjet.decode(buffer, (err, decoded) => {
        /*
         * WebAssembly Interaction [start]
         */
        var p = wasmInstanceWebP._create_buffer(decoded.width, decoded.height);
        wasmInstanceWebP.HEAP8.set(decoded.data, p);

        wasmInstanceWebP._encode(p, decoded.width, decoded.height, 100);

        const resultPointer = wasmInstanceWebP._get_result_pointer();
        const resultSize = wasmInstanceWebP._get_result_size();
        const resultView = new Uint8Array(wasmInstanceWebP.HEAP8.buffer, resultPointer, resultSize);
        const result = new Uint8Array(resultView);

        wasmInstanceWebP._free_result(resultPointer);
        wasmInstanceWebP._destroy_buffer(p);
        /*
         * WebAssembly Interaction [finish]
         */

        fs.writeFileSync(req.file.path + ".webp", Buffer.from(result));

        console.log(new Date().toString() + ": encoded a JPG " + req.file.filename + " of " + decoded.width + "*" + decoded.height + " to WebP");
        
        res.send(req.file.filename);
    });
});

app.get("/downloadwebp", (req, res) => {
    const imgID = req.query.imgID;

    const buffer = fs.readFileSync(path.join(__dirname, "../uploads2/" + imgID + ".webp"));
    res.send(buffer);

    console.log(new Date().toString() + ": sent " + imgID + ".webp to a client");
});

/*
 * Setup for WebAssembly modules
 *
 */
const fs = require('fs');

// Fibonacci WASM loading + instantiation
const wasmBufferFib = fs.readFileSync(path.join(__dirname, "../public/fibonacci/fibonacci.wasm"));
var nthfibno, wasmInstanceFib;
WebAssembly.instantiate(wasmBufferFib).then(wasmModule => {
    wasmInstanceFib = wasmModule.instance;
    nthfibno = wasmModule.instance.exports.nthFibNo;

    console.log(new Date().toString() + ": WebAssembly module for fibonacci loaded");
});

// WebP Encoding WASM loading + instatiation with help of Emscripten generated modulaised JS glue code file
var factory = require('./webp/webp.js');
var wasmInstanceWebP;
factory().then((instance) => {
    wasmInstanceWebP = instance;

    console.log(new Date().toString() + ": WebP encoder module for fibonacci loaded");
});

/*
 * Setup for socketing
 *
 */
io.sockets.on("error", (e) => {
    console.log(new Date.toString() + ": " + e);
});

io.sockets.on("connection", socket => {
    console.log(new Date().toString() + ": " + socket.id + " has connected");

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
        console.log(new Date().toString() + ": remote session on " + socket.id + " initialised for " + data.to);
    });

    socket.on("disconnect", () => {
        io.sockets.emit("client-session-disconnected", {
            socket: socket.id
        });
        console.log(new Date().toString() + ": " + socket.id + " has disconnected");
    });
});

/*
 * Initialisation
 *
 */
server.listen(port, () => {
    console.log(new Date().toString() + `: server listening at http://localhost:${port}`);
});
