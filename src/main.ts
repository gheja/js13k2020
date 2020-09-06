let ticks = 0;
let _gfx: WebglGfx;
let _gfx2: WebglGfx;

function tick()
{
    ticks++;
    _gfx.objects[1].rz += 0.01;
    _gfx.resize();
    _gfx.render();
    _gfx2.resize();
    _gfx2.render();
    window.requestAnimationFrame(tick);
}

function init()
{
    initTooltips();

    _gfx = new WebglGfx("c1");
    _gfx2 = new WebglGfx("c2");

    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;
    tick();
}

window.addEventListener("load", init);
