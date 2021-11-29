const express = require('express');
const path = require('path');

const app = express();

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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});