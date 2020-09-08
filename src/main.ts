let ticks = 0;
let _gfx: WebglGfx;
let _gfx2: WebglGfx;
let _roads: Network;

function tick()
{
    ticks++;
    _gfx.objects[1].rz += 0.01;
    _gfx.resize();
    _gfx.render();
    _gfx2.resize();
    _gfx2.render();
    _roads.pickNode(_gfx.cursorWorldPosition, true);
    window.requestAnimationFrame(tick);
}

function demoNetwork()
{
    let p1: tNetworkNode;
    let p2: tNetworkNode;
    let p3: tNetworkNode;
    let p4: tNetworkNode;

    _roads = new Network();

    p1 = _roads.addNode([ -10, -10, 0 ], true);
    p2 = _roads.addNode([ -10, 0, 0 ], false);
    p3 = _roads.addNode([ 0, 10, 0 ], false);
    p4 = _roads.addNode([ 10, 5, 0 ], true);

    _roads.addEdge(p1, p2, true);
    _roads.addEdge(p2, p3, true);
    _roads.addEdge(p3, p4, true);

    _roads.rebuild();
}

function init()
{

    initTooltips();

    _gfx = new WebglGfx("c1");
    _gfx2 = new WebglGfx("c2");

    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;

    demoNetwork();

    tick();
}

window.addEventListener("load", init);
