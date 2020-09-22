"use strict";

let _mouseX = 0;
let _mouseY = 0;
let _mouseDown = false;
let _mouseDownPosition: tVec3;
let _mouseDownCameraPosition: tVec3;
let _mouseOverToolbar = false;
let _viewX = 0;
let _viewY = 0;
let _viewZoom = 5;

let _viewXMin = -20;
let _viewXMax = 20;
let _viewYMin = -20;
let _viewYMax = 20;
let _viewZoomMin = 0;
let _viewZoomMax = 10;

let _keys: Array<boolean>;

let _highlightedObject: any;
let _highlightedObjectType: number;
let _stationBeingPlaced: Station;

const HOT_NONE = 0;
const HOT_NODE = 1;
const HOT_STATION = 2;
const HOT_VEHICLE = 3;

function onTouchStart(event: TouchEvent)
{
    _mouseX = event.touches[0].screenX;
    _mouseY = event.touches[0].screenY;
}

function highlightClear()
{
    _highlightedObject = null;
    _highlightedObjectType = HOT_NONE;
    // objectSetHighlight(false); ?
}

function highlightThese(networkNode: boolean, station: boolean, vehicle: boolean)
{
    let x: any;

    highlightClear();

    if (vehicle)
    {
        for (x of _vehicles)
        {
            if (distance3D(x.position, _gfx.cursorWorldPosition) < 5)
            {
                _highlightedObject = x;
                _highlightedObjectType = HOT_VEHICLE;
                return;
            }
        }
    }

    if (networkNode)
    {
        _roads.highlight(null);
        highlightStaion(null);

        x = _roads.pickNode(_gfx.cursorWorldPosition, false);

        if (x)
        {
            if (!x.locked)
            {
                _roads.highlight(x, NETWORK_NODE_HIGHLIGHT_INVALID);

                _highlightedObjectType = HOT_NODE;
                _highlightedObject = x;
                return;
            }
        }
    }

    if (station)
    {
        _highlightedObject = pickStation(_gfx.cursorWorldPosition);
        if (_highlightedObject)
        {
            _highlightedObjectType = HOT_STATION;
            return;
        }
    }
}

function objectSetHighlight(value: boolean)
{
    if (!value || _highlightedObjectType == HOT_NONE)
    {
        _gfx.canvas.classList.remove("clickable");
    }
    else
    {
        _gfx.canvas.classList.add("clickable");
    }

    if (_highlightedObjectType == HOT_VEHICLE || _highlightedObjectType == HOT_STATION)
    {
        _highlightedObject.setHighlight(value);
    }
}

function onMouseMove(event: MouseEvent)
{
    let x: number;
    let y: number;
    let tip1: string;
    let tip2: string;

    try
    {
        if (event instanceof TouchEvent)
        {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        }
        else
        {
            x = event.clientX;
            y = event.clientY;
        }
    }
    catch (e) {}

    windowUpdatePosition(x - _mouseX, y - _mouseY)

    if (_mouseDown && event.target == _gfx.canvas)
    {
        _viewX += (x - _mouseX) * (_gfx.cam.z / 800);
        _viewY += (y - _mouseY) * (_gfx.cam.z / 800);
    }

    _mouseX = x;
    _mouseY = y;

    objectSetHighlight(false);

    if (_mouseOverToolbar)
    {
        return;
    }

    tip1 = "";
    tip2 = "";

    if (_activeTool == TOOL_INFO)
    {
        tip2 = "*";
        highlightThese(false, true, true);
    }
    else if (_activeTool == TOOL_DELETE)
    {
        tip1 = "Select an object to destroy";
        tip2 = "Destroy *";
        highlightThese(true, true, false);
    }
    else if (_activeTool == TOOL_VEHICLE_SCHEDULE_APPEND)
    {
        tip1 = "Select a Station or Depot to add to schedule";
        tip2 = "Add * to schedule";
        highlightThese(false, true, false);
    }
    else if (_activeTool == TOOL_ROAD_BEGIN)
    {
        tip1 = "Pick a road node";
    }
    else if (_activeTool == TOOL_ROAD_END)
    {
        tip1 = "Pick the end of the road";
    }
    else if (_activeTool == TOOL_ROAD_STATION)
    {
        tip1 = "Build a Station";
    }
    else if (_activeTool == TOOL_ROAD_DEPOT)
    {
        tip1 = "Build a Depot";
    }
    else if (_activeTool == TOOL_DIRECTION)
    {
        tip1 = "Select facing";
        _stationBeingPlaced.setAngle(getAngle2D(_stationBeingPlaced.position, _gfx.cursorWorldPosition) + Math.PI / 2);
    }
/*
    // TODO: highlight is a bit different here, see onMouseClick...
    else if (_activeTool == TOOL_ROAD_BEGIN || _activeTool == TOOL_ROAD_END)
    {
        highlightThese(true, false, false);
    }
*/


    objectSetHighlight(true);

    if (_highlightedObject && _highlightedObject.title && tip2)
    {
        tooltipSet(tip2.replace("*", _highlightedObject.title));
    }
    else
    {
        tooltipSet(tip1);
    }
}

function onMouseClick(event)
{
    let x: any;

    if (event.target != _gfx.canvas)
    {
        return;
    }

    // TODO: there are several highliht methods, merge them...

    switch (_activeTool)
    {
        case TOOL_INFO:
            if (_highlightedObjectType == HOT_VEHICLE)
            {
                windowCreate(WINDOW_TYPE_VEHICLE, _highlightedObject.vehicleIndex, 0);
            }

            if (_highlightedObjectType == HOT_STATION)
            {
                windowCreate(WINDOW_TYPE_STATION, _highlightedObject.stationIndex, 0);
            }
        break;

        case TOOL_ROAD_BEGIN:
            x = _roads.pickNode(_gfx.cursorWorldPosition, false);

            if (x)
            {
                _roads.editPick(x);
                _activeTool = TOOL_ROAD_END;
            }
        break;

        case TOOL_ROAD_END:
            if (tryToSpend(100, STAT_SPENT_BUILDING))
            {
                _roads.editFinish();
                _activeTool = TOOL_ROAD_BEGIN;
                _roads.editStart();
            }
        break;

        case TOOL_DELETE:
            if (_highlightedObjectType == HOT_NODE)
            {
/*
                // taken care of earlier

                if (_highlightedObject.locked)
                {
                    windowCreateGeneric("Cannot delete road", "It is locked.");
                    return;
                }
*/
                if (tryToSpend(50, STAT_SPENT_BUILDING))
                {

                    if (!_roads.tryToDeleteNode(_highlightedObject))
                    {
                        // if could not delete, refund
                        newIncome(50);
                    }
                    _roads.rebuildGfx();
                }
                return;
            }

            if (_highlightedObjectType == HOT_STATION)
            {
                tryToDeleteStation(_highlightedObject);
            }
        break;

        case TOOL_VEHICLE_SCHEDULE_APPEND:
            if (_highlightedObject)
            {
                _vehicleEdited.schedule.push({station: _highlightedObject});
                setTool(TOOL_INFO);
            }
        break;

        case TOOL_ROAD_DEPOT:
            if (tryToSpend(5000, STAT_SPENT_BUILDING))
            {
                _stationBeingPlaced = new Station(_gfx.cursorWorldPosition, true);
                _activeTool = TOOL_DIRECTION;
                _stations.push(_stationBeingPlaced);
            }
        break;

        case TOOL_ROAD_STATION:
            if (tryToSpend(2000, STAT_SPENT_BUILDING))
            {
                _stationBeingPlaced = new Station(_gfx.cursorWorldPosition, false);
                _activeTool = TOOL_DIRECTION;
                _stations.push(_stationBeingPlaced);
            }
        break;

        case TOOL_DIRECTION:
            setTool(TOOL_INFO);
        break;
    }
}

function onMouseDown(event: MouseEvent)
{
    if (event.target == _gfx.canvas)
    {
        _mouseDownPosition = F32A(_gfx.cursorWorldPosition);
        _mouseDownCameraPosition = F32A([_gfx.cam.x, _gfx.cam.y, _gfx.cam.z]);
        _mouseDown = true;
    }
}

function onMouseUp()
{
    _mouseDown = false;
}

function updateView()
{
    let n;

    _viewZoom = clamp(_viewZoom, _viewZoomMin, _viewZoomMax);
    _viewX = clamp(_viewX, _viewXMin, _viewXMax);
    _viewY = clamp(_viewY, _viewYMin, _viewYMax);

    n = Math.pow(_viewZoom / _viewZoomMax, 2);
    _gfx.cam.x = - _viewX;
    _gfx.cam.y = -50 * (1 - n) + _viewY;
    _gfx.cam.z = 5 + n * 100;
    _gfx.cam.rx = 1.5 - n * 1.5;
}

function onMouseWheel(event: WheelEvent)
{
    if (event.deltaY < 0)
    {
        _viewZoom--;
    }
    else
    {
        _viewZoom++;
    }

    updateView();
}

function initGui()
{
    _keys = [];

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("click", onMouseClick);
//    window.addEventListener("mousewheel", onMouseWheel);
}