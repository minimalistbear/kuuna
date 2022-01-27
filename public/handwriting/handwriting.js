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
};
function downloadAsImage() {
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = 'writing';
    a.click();

    clearCanvas();
};