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
