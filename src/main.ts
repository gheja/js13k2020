let ticks = 0;
let _gfx: WebglGfx;
let _gfx2: WebglGfx;
let _roads: Network;
let _previewObject: any;

let _factories: Array<Factory>;
let _vehicles: Array<Vehicle>;
let _stations: Array<Station>;

let _creditsLoanMax;
let _creditsBalance;

function loan1(x)
{
    _stats[STAT_LOAN_TAKEN] += x;
}

function loan2(x)
{
    _stats[STAT_LOAN_REPAID] += x;
}

function updateStatuses()
{
    _creditsBalance =
        + _stats[STAT_LOAN_TAKEN]
        - _stats[STAT_LOAN_REPAID]
        - _stats[STAT_LOAN_INTEREST_PAID]
        + _stats[STAT_CREDITS]
        - _stats[STAT_SPENT_BUILDING]
        - _stats[STAT_SPENT_UPKEEP]
        - _stats[STAT_SPENT_OTHER];

    updateInnerHTML(document.getElementById("credits"), moneyFormat(_creditsBalance));
    updateInnerHTML(document.getElementById("time"), getTime(_stats[STAT_TICKS]));

}

function openBank()
{
    windowCreate(WINDOW_TYPE_BANK, 0, 0);
}

function openStats()
{
    windowCreate(WINDOW_TYPE_STATS, 0, 0);
}

function tick()
{
    ticks++;

    increaseStat(STAT_TICKS, 1);

    if (ticks % 300 == 1)
    {
        _factories.forEach(x => x.produce());
    }

    _gfx.objects[1].rz += 0.01;

    _vehicles.forEach(x => x.step());

    if (_previewObject)
    {
       _previewObject.rz += 0.03;
    }

    updateView();

    _gfx.resize();
    _gfx.render();
    _gfx2.resize();
    _gfx2.render();
    _roads.pickNode(_gfx.cursorWorldPosition, true);

    updateStatuses();
    windowUpdateContents();

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

    let f: Factory;
    let v: Vehicle;
    let s: Station;

    _factories = [];
    _vehicles = [];
    _stations = [];

    f = new Factory([ -13, -10, 0 ]);
    f.goodProduction[GOOD_PASSENGER] = 5;
    f.goodCapacity[GOOD_PASSENGER] = 9;
    _factories.push(f);

    f = new Factory([ 7, 8, 0 ]);
    f.goodAccepted[GOOD_PASSENGER] = 1;
    f.goodAccepted[GOOD_MAIL] = 1;
    _factories.push(f);

    f = new Factory([ 13, 8, 0 ]);
    f.goodProduction[GOOD_MAIL] = 10;
    f.goodCapacity[GOOD_MAIL] = 20;
    _factories.push(f);

    f = new Factory([ 22, -8, 0 ]);
    f.goodProduction[GOOD_MAIL] = 90;
    f.goodCapacity[GOOD_MAIL] = 200;
    _factories.push(f);

    _stations.push(new Station([ -10, -10, 0 ]));
    _stations.push(new Station([ 10, 8, 0 ]));
    _stations.push(new Station([ 22, -6, 0 ]));

    _roads = new Network();

    p1 = _roads.addNode([ -10, -10, 0 ], true, _stations[0]);
    p2 = _roads.addNode([ -10, 0, 0 ], false);
    p3 = _roads.addNode([ 0, 10, 0 ], false);
    p4 = _roads.addNode([ 5, 5, 0 ], true);
    p5 = _roads.addNode([ 10, 8, 0 ], true, _stations[1]);
    p6 = _roads.addNode([ 22, -6, 0 ], true, _stations[2]);

    _roads.addEdge(p1, p2, true);
    _roads.addEdge(p2, p3, true);
    _roads.addEdge(p3, p4, true);
    _roads.addEdge(p4, p6, true);
    _roads.addEdge(p3, p5, true);
    _roads.addEdge(p5, p6, true);

    _roads.rebuild();

    v = new Vehicle(_stations[0]);

    v.schedule = [
        { station: _stations[0] },
        { station: _stations[1] },
        { station: _stations[2] },
    ];

    v.goodCapacity[GOOD_PASSENGER] = 10;
    v.goodCapacity[GOOD_MAIL] = 100;

    _vehicles.push(v);

    console.log(_roads.getPath(p1, p6));
}

function initGfx()
{
    _gfx = new WebglGfx("c1");
    _gfx.createObject(SHAPE_PLANE_INDEX);
    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;
}

function initGfx2()
{
    let x, y, a;

    _gfx2 = new WebglGfx("c2");
    _gfx2.cam.z = 5;
    _gfx2.cam.y = -10
    _gfx2.cam.rx = 1.2;

    for (x=-20; x<20; x++)
    {
        for (y=-20; y<20; y++)
        {
            a = _gfx2.createObject(((x + y) % 2) ? SHAPE_PLANE_SMALL1_INDEX : SHAPE_PLANE_SMALL2_INDEX);
            a.x = x;
            a.y = y;
        }
    }

    _previewObject = _gfx2.createObject(SHAPE_VEHICLE_BUS_YELLOW_INDEX);
}

function initLoan()
{
    _creditsLoanMax = 50000;
}

function init()
{
    initGfx();
    initGfx2();

    initStats();
    initGui();
    initTooltip();
    initLoan();

    demoNetwork();

    tick();
}

window.addEventListener("load", init);
