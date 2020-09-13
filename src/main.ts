let ticks = 0;
let _gfx: WebglGfx;
let _gfx2: WebglGfx;
let _roads: Network;
let _previewObject: any;

let _factories: Array<Factory>;
let _vehicles: Array<Vehicle>;
let _stations: Array<Station>;

let _creditsBalance;
let _creditsLoanMax;
let _creditsLoanInterestPerDay;

let _activeTool;

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

    _creditsLoanInterestPerDay = (_stats[STAT_LOAN_TAKEN] - _stats[STAT_LOAN_REPAID]) * LOAN_INTEREST_PER_DAY;

    updateInnerHTML(document.getElementById("credits"), moneyFormat(_creditsBalance));
    updateInnerHTML(document.getElementById("time"), getTime(_stats[STAT_TICKS]));
}

function onDayPassed()
{
    // TODO: subtract loan interest
}

function openBank()
{
    windowCreate(WINDOW_TYPE_BANK, 0, 0);
}

function openStats()
{
    windowCreate(WINDOW_TYPE_STATS, 0, 0);
}

function setTool(tool: number)
{
    highlightClear();

    _activeTool = tool;

    // in case TOOL_ROAD_* was the previous one
    _roads.editCancel();
    _roads.rebuildGfx();

    if (tool == TOOL_DELETE || tool == TOOL_ROAD_BEGIN)
    {
        _roads.editStart();
    }
}

function setToolInfo()
{
    setTool(TOOL_INFO);
}

function setToolDelete()
{
    setTool(TOOL_DELETE);
}

function setToolRoad()
{
    setTool(TOOL_ROAD_BEGIN);
}

function setToolScheduleAppend()
{
    setTool(TOOL_VEHICLE_SCHEDULE_APPEND);
}

function setToolDepot()
{
    setTool(TOOL_ROAD_DEPOT);
}

function setToolStation()
{
    setTool(TOOL_ROAD_STATION);
}

function tryToDeleteStation(station: Station)
{
    let ok;

    ok = true;

    _vehicles.forEach(vehicle => {
       vehicle.schedule.forEach(schedule => {
          if (schedule.station === station)
          {
              windowCreateGeneric("Cannot delete station", vehicle.title + " has this as destination.");
              ok = false;
          }
       });
    });

    if (ok)
    {
        if (tryToSpend(500, STAT_SPENT_BUILDING))
        {
            station.destroy();
            removeFromArray(_stations, station);
        }
    }
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

    if (_activeTool == TOOL_ROAD_END)
    {
        _roads.editUpdate();
    }

    updateView();

    _gfx.resize();
    _gfx.render();
    _gfx2.resize();
    _gfx2.render();

    updateStatuses();
    windowUpdateContents();

    window.requestAnimationFrame(tick);
}

function initMap()
{
    _factories = [];
    _vehicles = [];
    _stations = [];

    _roads = new Network();
}

function demoNetwork()
{
    let f: Factory;
    let v: Vehicle;


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


    _stations.push(new Station([ -10, -10, 0 ], false));
    _stations.push(new Station([ 10, 8, 0 ], false));
    _stations.push(new Station([ 22, -6, 0 ], false));
    _stations.push(new Station([ 0, 30, 0 ], true));


    v = new Vehicle(_stations[3]);

    v.schedule = [
        { station: _stations[0] },
        { station: _stations[1] },
        { station: _stations[2] },
    ];

    v.goodCapacity[GOOD_PASSENGER] = 10;
    v.goodCapacity[GOOD_MAIL] = 100;

    _vehicles.push(v);
}

function initGfx()
{
    _gfx = new WebglGfx("c1", true);
    _gfx.createObject(SHAPE_PLANE_INDEX);
    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;
}

function initGfx2()
{
    let x, y, a;

    _gfx2 = new WebglGfx("c2", false);
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
    initMap();

    demoNetwork();

    setToolInfo();

    tick();
}

window.addEventListener("load", init);
