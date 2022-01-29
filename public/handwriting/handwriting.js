// Constants + global variables
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var boundings = canvas.getBoundingClientRect();

context.strokeStyle = '#702fa0';
context.lineWidth = 4;

/*
 * Mouse Event Handlers
 *
 */
var isDrawing = false;
var mouseX = 0;
var mouseY = 0;
canvas.addEventListener('mousedown', function(event) {
    setMouseCoordinates(event);
    isDrawing = true;

    context.beginPath();
    context.moveTo(mouseX, mouseY);
});
canvas.addEventListener('mousemove', function(event) {
    setMouseCoordinates(event);

    if(isDrawing){
        context.lineTo(mouseX, mouseY);
        context.stroke();
    }
});
canvas.addEventListener('mouseup', function(event) {
    setMouseCoordinates(event);
    isDrawing = false;
});
function setMouseCoordinates(event) {
    mouseX = event.clientX - boundings.left;
    mouseY = event.clientY - boundings.top;
}

/*
 * Button Handlers
 *
 */
function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("xField").innerHTML = '';
    document.getElementById("msField").innerHTML = '[time elapsed]';
};
async function runRecognition() {
    var now = new Date();

    var canvasDataURL = canvas.toDataURL();
    var recognisedString;

    var machine = document.getElementById("inputGroupSelectMachine").value;
    document.getElementById("overlay").style.display = "block";

    if(machine == "client") {
        setTimeout(() => {
            // Execution of function is blocking
            recognisedString = _readCharacters(canvasDataURL);

            document.getElementById("xField").innerHTML = recognisedString;
    
            var msElapsed = new Date() - now;
            document.getElementById("msField").innerHTML = msElapsed - 50 + "ms";

            document.getElementById("overlay").style.display = "none";
        }, 50);
    } else if(machine == "server") {
        var blob = await fetch(canvasDataURL).then(r => r.blob());
        var data = new FormData();
        data.append("canvasUpload", blob);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/handwriting");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 || 2) {
                recognisedString = xhr.responseText;

                document.getElementById("xField").innerHTML = recognisedString;

                var msElapsed = new Date() - now;
                document.getElementById("msField").innerHTML = msElapsed + "ms";

                document.getElementById("overlay").style.display = "none";
            }
        };
    
        xhr.send(data);
        return;
    } else {
        return;
    }

    // Code for downloading *.png
    /*
        var a = document.createElement('a');
        a.href = canvasDataURL;
        a.download = 'writing';
        a.click();
    */
};

function _readCharacters(location) {
    return "[client not implemented yet]";
}