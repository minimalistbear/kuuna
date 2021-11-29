var stats0 = new Stats();
var stats1 = new Stats();
var stats2 = new Stats();

stats0.showPanel(0);
stats1.showPanel(1);
stats2.showPanel(2);
stats0.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
stats1.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
stats2.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';

document.body.appendChild(stats0.dom);
document.body.appendChild(stats1.dom);
document.body.appendChild(stats2.dom);

function animate() {
    stats0.update();
    stats1.update();
    stats2.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);