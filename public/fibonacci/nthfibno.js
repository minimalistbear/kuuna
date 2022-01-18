function calculate() {
    var n = document.querySelector('input').value;

    document.getElementById("xField").innerHTML = "";
    document.getElementById("msField").innerHTML = "[time elapsed]";

    document.getElementById("invalidNoAlert").classList.remove("d-flex");
    document.getElementById("invalidNoAlert").display = "none";

    if(Number.isInteger(parseFloat(n)) && parseInt(n) > 0 && !Number.isNaN(n)) {
        var now = new Date();
        var x;

        n = parseInt(n);

        var machine = document.getElementById("inputGroupSelectMachine").value;
        if(machine == "client") {
            x = _nthFibNo(n);
        } else if(machine == "server") {
            // TODO
            x = 'not supported yet';
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