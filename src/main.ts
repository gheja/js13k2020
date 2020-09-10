let ticks = 0;
let _gfx: WebglGfx;
let _gfx2: WebglGfx;
let _roads: Network;
let _demoVehicle: Vehicle;

let s1: Station;
let s2: Station;

function tick()
{
    ticks++;
    if (ticks % 300 == 1)
    {
        s1.produceGoods();
        s2.produceGoods();
    }

    _gfx.objects[1].rz += 0.01;

    _demoVehicle.step();
    
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
    let p5: tNetworkNode;
    let p6: tNetworkNode;

    s1 = new Station([ -10, -10, 0 ]);
    s2 = new Station([ 10, 8, 0 ]);

    s1.goodProduction[GOOD_PASSENGER] = 5;
    s1.goodCapacity[GOOD_PASSENGER] = 9;

    s2.goodAccepted[GOOD_PASSENGER] = 1;

    _roads = new Network();

    p1 = _roads.addNode([ -10, -10, 0 ], true, s1);
    p2 = _roads.addNode([ -10, 0, 0 ], false);
    p3 = _roads.addNode([ 0, 10, 0 ], false);
    p4 = _roads.addNode([ 5, 5, 0 ], true);
    p5 = _roads.addNode([ 10, 8, 0 ], true, s2);
    p6 = _roads.addNode([ 12, 0, 0 ], true);

    _roads.addEdge(p1, p2, true);
    _roads.addEdge(p2, p3, true);
    _roads.addEdge(p3, p4, true);
    _roads.addEdge(p4, p6, true);
    _roads.addEdge(p3, p5, true);
    _roads.addEdge(p5, p6, true);

    _roads.rebuild();

    _demoVehicle = new Vehicle(s1);
    _demoVehicle.schedule = [
        { station: s1 },
        { station: s2 },
    ];
    _demoVehicle.goodCapacity[GOOD_PASSENGER] = 100;

    console.log(_roads.getPath(p1, p6));
}

function init()
{
    let a;

    initTooltips();

    _gfx = new WebglGfx("c1");
    _gfx2 = new WebglGfx("c2");

    for (a of [ _gfx, _gfx2 ])
    {
        a.createObject(SHAPE_PLANE_INDEX);
        a.createObject(SHAPE_TRAIN1_INDEX);
        a.createObject(SHAPE_CURSOR_INDEX);
    }

    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;

    demoNetwork();

    tick();
}

window.addEventListener("load", init);
