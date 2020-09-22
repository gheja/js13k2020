let ticks = 0;
let _timeStarted;
let _time;
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
let _gameState;

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
    setToolInfo();
    windowCreate(WINDOW_TYPE_BANK, 0, 0);
}

function openStats()
{
    setToolInfo();
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

    _gfx.cursorObject.visible = (tool == TOOL_ROAD_DEPOT || tool == TOOL_ROAD_STATION);
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

function checkWin()
{
    if (
        _stats[STAT_LOAN_TAKEN] == _stats[STAT_LOAN_REPAID] &&
        _stats[STAT_PASSENGER_DELIVERED] >= 404
    )
    {
        windowCreateGeneric("You won!", "Congratulations, you've completed the objectives and won!<br/><br/>Thanks for playing! Feel free to continue.");
    }
    else
    {
        windowCreateGeneric("Oh no!", "You could not finish the objectives in time.<br/><br/>Don't worry, feel free to keep playing or start again by reloading the page.");
    }
}

function tick()
{
    ticks++;
    _time = (new Date().getTime()) - _timeStarted;

    if (_time > 404000 && _gameState == GAME_STATE_RUNNING)
    {
        _gameState = GAME_STATE_FINISHED;
        checkWin();
    }

    increaseStat(STAT_TICKS, 1);

    if (ticks % 300 == 1)
    {
        _factories.forEach(x => x.produce());
    }

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

    if (_gfx2.canvas.getBoundingClientRect().width != 0)
    {
        _gfx2.resize();
        _gfx2.render();
    }

    tooltipUpdate();
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
    let s: Station;
    let v: Vehicle;

    let p1, p2, p3;

    f = new Factory([ -41, -1, 0 ]);
    f.goodProduction[GOOD_PASSENGER] = 5;
    f.goodProduction[GOOD_MAIL] = 3;
    f.goodCapacity[GOOD_PASSENGER] = 14;
    f.goodCapacity[GOOD_MAIL] = 20;
    f.goodAccepted[GOOD_PASSENGER] = 1;
    _factories.push(f);

    f = new Factory([ -16, -30, 0 ]);
    f.goodProduction[GOOD_PASSENGER] = 2;
    f.goodCapacity[GOOD_PASSENGER] = 17;
    f.goodAccepted[GOOD_PASSENGER] = 1;
    f.goodAccepted[GOOD_MAIL] = 1;
    f.goodAccepted[GOOD_PACKAGE] = 1;
    _factories.push(f);

    f = new Factory([ -7, -20, 0 ]);
    f.goodProduction[GOOD_PASSENGER] = 4;
    f.goodProduction[GOOD_MAIL] = 10;
    f.goodCapacity[GOOD_PASSENGER] = 20;
    f.goodCapacity[GOOD_MAIL] = 20;
    f.goodAccepted[GOOD_PASSENGER] = 1;
    f.goodAccepted[GOOD_MAIL] = 1;
    f.goodAccepted[GOOD_PACKAGE] = 1;
    _factories.push(f);

    f = new Factory([ 40, 7, 0 ]);
    f.goodProduction[GOOD_MAIL] = 90;
    f.goodProduction[GOOD_PACKAGE] = 1;
    f.goodCapacity[GOOD_MAIL] = 320;
    f.goodCapacity[GOOD_PACKAGE] = 5;
    f.goodAccepted[GOOD_MAIL] = 1;
    f.goodAccepted[GOOD_PACKAGE] = 1;
    _factories.push(f);

    f = new Factory([ 22, 30, 0 ]);
    f.goodProduction[GOOD_PASSENGER] = 9;
    f.goodProduction[GOOD_MAIL] = 90;
    f.goodProduction[GOOD_PACKAGE] = 2;
    f.goodCapacity[GOOD_PASSENGER] = 21;
    f.goodCapacity[GOOD_MAIL] = 200;
    f.goodCapacity[GOOD_PACKAGE] = 6;
    f.goodAccepted[GOOD_PASSENGER] = 1;
    f.goodAccepted[GOOD_MAIL] = 1;
    f.goodAccepted[GOOD_PACKAGE] = 1;
    _factories.push(f);

    s = new Station([ -36, -3, 0 ], false);
    s.setAngle(1.2);
    _stations.push(s);

    s = new Station([ -4, -11, 0 ], false);
    s.setAngle(-1.8);
    _stations.push(s);

    s = new Station([ -58, 14, 0 ], true);
    s.setAngle(1.2);
    _stations.push(s);

    p1 = _roads.addNode([ -47, 0, 0]);
    p2 = _roads.addNode([ -27, -5, 0]);
    p3 = _roads.addNode([ -20, -6, 0]);

    _roads.addEdge(_stations[2].roadParts[2], p1)
    _roads.addEdge(p1, _stations[0].roadParts[0])
    _roads.addEdge(_stations[0].roadParts[2], p2)
    _roads.addEdge(p2, p3)
    _roads.addEdge(p3, _stations[1].roadParts[2])
    _roads.rebuildGfx();

    v = new Vehicle(_stations[2]);
    v.schedule = [
        { station: _stations[1] },
        { station: _stations[0] }
    ];
    v.goodCapacity = VEHICLE_DEFINITIONS[0][VD_GOODS].slice();
    v.webglGfxObject.rz = _stations[2].webglGfxObject.rz;
    v.value = VEHICLE_DEFINITIONS[0][VD_COST] * 0.7;

    window.setTimeout(v.toggleStopped.bind(v), 5000);

    _vehicles.push(v);
}

function initGfx()
{
    _gfx = new WebglGfx("c1", true);
    _gfx.createObject(SHAPE_PLANE_INDEX);
    _gfx.cam.z = 20;
    _gfx.cam.y = -20;
    _gfx.cam.rx = 0.9;
    _gfx.cursorObject.visible = false;
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

/*
// I started to rewrite toolbar construction but meh
function toolbarAdd(title: string, emoji: string, callback: any)
{
    let a;

    a = document.createElement("div");
    a.className = "button";
    a.dataset["tooltip"] = title;
    a.innerHTML = emoji;
    a.addEventListener("click", (event) => { event.stopPropagation(); callback; }, true);

    document.getElementById("toolbar").appendChild(a);
}

function initToolbar()
{
    toolbarAdd("Info", "💭", setToolInfo);
    toolbarAdd("Delete", "", setToolDelete);
    toolbarAdd("Road construction", "", setToolRoad);
    toolbarAdd("Depot", "", setToolDepot);
    toolbarAdd("Station", "🔁", setToolStation);
    toolbarAdd("Contracts", "📜", null);
    toolbarAdd("Research", "🧪", null);
    toolbarAdd("Bank", "💵", openBank);
    toolbarAdd("Statistics", "📊", openStats);
}
*/

function init()
{
    _timeStarted = new Date().getTime();
    _gameState = GAME_STATE_RUNNING;

    initGfx();
    initGfx2();

    initStats();
    initGui();
    initTooltip();
    initLoan();
    initMap();

    demoNetwork();

    setToolInfo();

    windowCreateGeneric("Welcome to Raccoon Transport 404!", `Can you transport 404 people in 404 seconds?<br><br>
They want to get from one city to another, represented by these red circles.<br><br>
Buy and sell buses in the <span>Depot</span>, they stop at <span>Stops</span> according to their <span>Schedule</span> accessed by clicking on them.<br><br>
If you need money, check the <span>Bank</span> but be careful to repay before the timer is up.<br><br>
Build roads and buildings using the tools above.<br><br>
Oh, and all the drivers are on vacation. But we have the next best thing: raccoons. They're a bit hectic but we like them anyway.<br><br>
Good luck! (You'll definitely need it.)`
    );

    tick();
}

window.addEventListener("load", init);
