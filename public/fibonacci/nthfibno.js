function calculate() {
    var n = document.querySelector('input').value;

    document.getElementById("xField").innerHTML = "";
    document.getElementById("msField").innerHTML = "[time elapsed]";

    document.getElementById("invalidNoAlert").classList.remove("d-flex");
    document.getElementById("invalidNoAlert").display = "none";

    if(Number.isInteger(parseFloat(n)) && parseInt(n) > 0 && parseInt(n) <= 42 && !Number.isNaN(n)) {
        var now = new Date();
        var x;

        n = parseInt(n);

        var machine = document.getElementById("inputGroupSelectMachine").value;
        if(machine == "client") {
            // Execution of function is blocking with large n
            x = _nthFibNo(n);
        } else if(machine == "server") {
            // XHR POST is non-blocking => using overlay while waiting for response
            document.getElementById("overlay").style.display = "block";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/fibonacci");
        
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    x = xhr.responseText;

                    document.getElementById("xField").innerHTML = x;
    
                    var msElapsed = new Date() - now;
                    document.getElementById("msField").innerHTML = msElapsed + "ms";

                    document.getElementById("overlay").style.display = "none";
                }
            };
        
            var data = `{"n":"${n}"}`;
        
            xhr.send(data);
            return;
        } else {
            return;
        }

        document.getElementById("xField").innerHTML = x;
    
        var msElapsed = new Date() - now;
        document.getElementById("msField").innerHTML = msElapsed + "ms";
    } else {
        document.getElementById("invalidNoAlert").classList.add("d-flex");
        document.getElementById("invalidNoAlert").display = "flex";
    }
}