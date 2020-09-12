"use strict";

let _mouseX = 0;
let _mouseY = 0;
let _mouseDown = false;
let _mouseDownPosition: tVec3;
let _mouseDownCameraPosition: tVec3;
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

function onTouchStart(event: TouchEvent)
{
    _mouseX = event.touches[0].screenX;
    _mouseY = event.touches[0].screenY;
}

function onMouseMove(event: MouseEvent|TouchEvent)
{
    if (event instanceof TouchEvent)
    {
        event.screenX = event.touches[0].screenX;
        event.screenY = event.touches[0].screenY;
    }

    windowUpdatePosition(event.screenX - _mouseX, event.screenY - _mouseY)

    if (_mouseDown && event.target == _gfx.canvas)
    {
        _viewX += (event.screenX - _mouseX) * (_gfx.cam.z / 800);
        _viewY += (event.screenY - _mouseY) * (_gfx.cam.z / 800);
    }

    _mouseX = event.screenX;
    _mouseY = event.screenY;
}

function onMouseClick()
{
    let x: any;

    switch (_activeTool)
    {
        case TOOL_INFO:
            for (x of _vehicles)
            {
                if (distance3D(x.position, _gfx.cursorWorldPosition) < 3)
                {
                    windowCreate(WINDOW_TYPE_VEHICLE, x.vehicleIndex, 0);
                    return;
                }
            }

            for (x of _stations)
            {
                if (distance3D(x.position, _gfx.cursorWorldPosition) < 1)
                {
                    windowCreate(WINDOW_TYPE_STATION, x.stationIndex, 0);
                    return;
                }
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
            _roads.editFinish();
            _activeTool = TOOL_ROAD_BEGIN;
            _roads.editStart();
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