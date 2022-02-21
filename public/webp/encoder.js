var result, imgID;

// Code for showing WebP image
/*
    function showImage() {
        const blob = new Blob([result], {type: 'image/webp'});
        const blobURL = URL.createObjectURL(blob);
        
        const img = document.createElement('img');
        img.src = blobURL;

        document.body.appendChild(img);
    }
*/

function downloadImage() {
    var machine = document.getElementById("inputGroupSelectMachine").value;

    if(machine == "client") {
        downloadImage2();
    } else if(machine == "server") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/downloadwebp?imgID=" + imgID);

        xhr.responseType = "arraybuffer";

        xhr.onload = function() {
            result = xhr.response;
            
            downloadImage2();
        }
        
        xhr.send();
    }
}

function downloadImage2() {
    const blob = new Blob([result], {type: 'image/webp'});
    const blobURL = URL.createObjectURL(blob);
    
    var a = document.createElement('a');
    a.href = blobURL;
    a.download = 'image.webp';
    a.click();
}

function encode() {
    var now = new Date();
    var machine = document.getElementById("inputGroupSelectMachine").value;
    document.getElementById("overlay").style.display = "block";

    if(machine == "client") {
        setTimeout(() => {
            const file = document.querySelector("input").files[0];

            const fr = new FileReader();
            fr.readAsArrayBuffer(file);
            fr.onload = function() {
                const imgBlob = new Blob([fr.result]);
                createImageBitmap(imgBlob).then((img) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
            
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
            
                    var image = ctx.getImageData(0, 0, img.width, img.height);

                    /*
                     * WebAssembly Interaction [start]
                     */
                    const p = _create_buffer(image.width, image.height);
                    Module.HEAP8.set(image.data, p);
        
                    // Execution of function is blocking with large images
                    _encode(p, image.width, image.height, 100);

                    const resultPointer = _get_result_pointer();
                    const resultSize = _get_result_size();
                    const resultView = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
                    result = new Uint8Array(resultView);
                    _free_result(resultPointer);
        
                    _destroy_buffer(p);
                    /*
                     * WebAssembly Interaction [finish]
                     */
        
                    // showImage(result);
                    document.getElementById("downloadWebPButton").disabled = false;
            
                    var msElapsed = new Date() - now;
                    document.getElementById("msField").innerHTML = msElapsed - 50 + "ms";
        
                    document.getElementById("overlay").style.display = "none";
                });
            }
        }, 50);
    } else if(machine == "server") {
        const file = document.querySelector("input").files[0];

        const fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = function() {
            const imgBlob = new Blob([fr.result]);
            var data = new FormData();
            data.append("imageUpload", imgBlob);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/webp");

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    document.getElementById("downloadWebPButton").disabled = false;

                    imgID = xhr.responseText;
                
                    var msElapsed = new Date() - now;
                    document.getElementById("msField").innerHTML = msElapsed + "ms";
        
                    document.getElementById("overlay").style.display = "none";
                }
            }

            xhr.send(data);
        }

        return;
    } else {
        return;
    }
}

var wasmLoaded = false;
var fileSelected = false;
Module.onRuntimeInitialized = async _ => {
    wasmLoaded = true;

    if(fileSelected) {
        document.getElementById("encodeButton").disabled = false;
    }
};

var jpgField = document.getElementById("jpgField");
jpgField.onchange = () => {
    document.getElementById("downloadWebPButton").disabled = true;
    document.getElementById("msField").innerHTML = "[time elapsed]";

    if(wasmLoaded && jpgField.value != "") {
        fileSelected = true;
        document.getElementById("encodeButton").disabled = false;
    } else {
        fileSelected = false;
        document.getElementById("encodeButton").disabled = true;
    }
}

var machine = document.getElementById("inputGroupSelectMachine");
machine.onchange = () => {
    document.getElementById("downloadWebPButton").disabled = true;
    document.getElementById("msField").innerHTML = "[time elapsed]";
}