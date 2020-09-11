"use strict";

// TODO: google closure compiler renames properties of domobject.dataset, now accessing it as array until fixed

let _windowZIndexSequence = 9000;

function windowMouseDown(event: MouseEvent)
{
    // console.log("down");
    (this as HTMLElement).dataset["selected"] = "1";
    (this as HTMLElement).style.zIndex = "" + (_windowZIndexSequence++);
}

function windowMouseUp()
{
    let a: HTMLElement;

    // console.log("up");

    for (a of document.querySelectorAll<HTMLElement>(".window"))
    {
        a.dataset["selected"] = "0";
    }
}

function windowUpdatePosition(dx, dy)
{
    let a: HTMLElement;
    let b: DOMRect;

    // console.log(dx, dy);

    for (a of document.querySelectorAll<HTMLElement>(".window"))
    {
        if (a.dataset["selected"] == "1")
        {
            b = a.getBoundingClientRect();
            a.style.top = b.top + dy + "px";
            a.style.left = b.left + dx + "px";
        }
    }
}

function windowClose()
{
    (this as HTMLElement).parentNode.removeChild((this as HTMLElement));
}

function windowCreate(windowType: number, objectIndex: number, tabIndex: number)
{
    let win: HTMLDivElement;
    let a: HTMLDivElement;

    win = document.createElement("div");
    win.className = "window";
    win.addEventListener("mousedown", windowMouseDown.bind(win));
    win.addEventListener("touchstart", windowMouseDown.bind(win));
    win.addEventListener("mouseup", windowMouseUp.bind(win));
    win.addEventListener("touchend" , windowMouseUp.bind(win));
    win.dataset["t"] = "" + windowType;
    win.dataset["i"] = "" + objectIndex;
    win.dataset["u"] = "" + tabIndex;
    win.style.zIndex = "" + (_windowZIndexSequence++);

    a = document.createElement("div");
    a.className = "title";
    a.innerHTML = "Choo-choo train";
    win.appendChild(a);

    a = document.createElement("div");
    a.className = "close";
    a.innerHTML = "X";
    a.addEventListener("click", windowClose.bind(win));
    win.appendChild(a);

    a = document.createElement("div");
    a.className = "body";
    a.innerHTML = "Class: <span>Loremipsu</span><br/>Capacity: <span>1300</span><br/>Cargo: <span>150</span><br/>Running cost: <span>$" + (Math.floor(Math.random() * 20 + 2) * 100) + "/year</span>";
    win.appendChild(a);

    document.body.appendChild(win);
}

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



function tooltipSet(s: string = "-")
{
    document.getElementById("tooltip").innerHTML = s ? s : "-";
}

function tooltipShow(e)
{
    tooltipSet((this.dataset["tooltip"] || "") + (this.classList.contains("button-disabled") ? " (locked)" : ""));
}

function tooltipHide(e)
{
    tooltipSet();
}

function initTooltips()
{
    let a: HTMLElement;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onMouseMove);

    for (a of document.querySelectorAll<HTMLElement>("*"))
    {
        if (a.dataset["tooltip"])
        {
            a.addEventListener("mouseover", tooltipShow.bind(a));
            a.addEventListener("mouseout", tooltipHide.bind(a));
        }
    }
}
