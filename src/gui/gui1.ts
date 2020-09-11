"use strict";

let _mouseX = 0;
let _mouseY = 0;

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
    _mouseX = event.screenX;
    _mouseY = event.screenY;
}

function initGui()
{
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onMouseMove);
}