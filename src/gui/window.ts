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

function windowUpdateContents()
{
    let win: HTMLElement;
    let bodyText: string;
    let titleText: string;
    let obj: any;
    let s: string;
    let i: any;
    let j: any;

    for (win of document.querySelectorAll<HTMLElement>(".window"))
    {
        bodyText = "";

        switch (parseInt(win.dataset["t"]))
        {
            case WINDOW_TYPE_VEHICLE:
                obj = _vehicles[win.dataset["i"]];
                titleText = obj.title;

                s = obj.schedule[obj.scheduleIndex].station.title;

                switch (obj.state)
                {
                    case VEHICLE_STATE_TRAVELLING:
                        bodyText += `Heading to ${s}`;
                    break;

                    case VEHICLE_STATE_ARRIVING:
                        bodyText += `Arriving at ${s}`;
                    break;

                    case VEHICLE_STATE_LEAVING:
                        bodyText += `Leaving ${s}`;
                    break;

                    case VEHICLE_STATE_ARRIVED:
                        bodyText += `Loading/unloading`;
                    break;
                }

                bodyText += "<br/>";

                for (i in obj.goodCapacity)
                {
                    if (obj.goodCapacity[i] > 0)
                    {
                        bodyText += `${GOOD_ICONS[i]} ${obj.goodOnboard[i]} / ${obj.goodCapacity[i]}<br/>`;
                    }
                }

                bodyText += "<hr/>";

                obj.schedule.forEach((x, i) => {
                    if (i == obj.scheduleIndex)
                    {
                        bodyText += "> ";
                    }

                    bodyText += x.station.title + "<br/>";
                });
            break;

            case WINDOW_TYPE_STATION:
                obj = _stations[win.dataset["i"]];
                titleText = obj.title;

                bodyText += `Waiting:<br/>`;

                for (j of obj.factoriesInRange)
                {
                    for (i in j.goodProduction)
                    {
                        if (j.goodProduction[i] > 0)
                        {
                            bodyText += `${GOOD_ICONS[i]} ${j.goodAvailable[i]} (+${j.goodProduction[i]}/min, ${j.goodCapacity[i]} max)<br/>`;
                        }
                    }
                }

                bodyText += `Accepts:<br/>`;

                for (j of obj.factoriesInRange)
                {
                    for (i in j.goodAccepted)
                    {
                        if (j.goodAccepted[i] > 0)
                        {
                            bodyText += `${GOOD_ICONS[i]} `;
                        }
                    }
                }
            break;

            case WINDOW_TYPE_STATS:
                titleText = "Statistics";

                for (i in STAT_TEXTS)
                {
                    if (STAT_TEXTS[i] != "")
                    {
                        bodyText += `${STAT_TEXTS[i]}: <b>${_stats[i]}</b><br/>`;
                    }
                }
            break;
        }

        if (bodyText != "")
        {
            updateInnerHTML(win.querySelector(".title") as HTMLDivElement, titleText);
            updateInnerHTML(win.querySelector(".body") as HTMLDivElement, bodyText);
        }
    }
}

function destroyDomObject(x)
{
    (x as HTMLElement).parentNode.removeChild((x as HTMLElement));
}

function windowClose()
{
    destroyDomObject(this);
}

function destroyWindow(windowType: number, objectIndex: number, tabIndex: number)
{
    let win: HTMLElement;

    for (win of document.querySelectorAll<HTMLElement>(".window"))
    {
        if (win.dataset["t"] == windowType && win.dataset["i"] == objectIndex && win.dataset["u"] == tabIndex)
        {
            destroyDomObject(win);
        }
    }
}

function windowCreateGeneric(title: string, body: string)
{
    let win: HTMLDivElement;
    let a: HTMLDivElement;

    win = document.createElement("div");
    win.className = "window";
    win.addEventListener("mousedown", windowMouseDown.bind(win));
    win.addEventListener("touchstart", windowMouseDown.bind(win));
    win.addEventListener("mouseup", windowMouseUp.bind(win));
    win.addEventListener("touchend" , windowMouseUp.bind(win));
    win.style.left = (document.body.clientWidth / 2 - 300) + "px";
    win.style.top = (100) + "px";
    win.style.zIndex = "" + (_windowZIndexSequence++);

    a = document.createElement("div");
    a.className = "title";
    updateInnerHTML(a, title);
    win.appendChild(a);

    a = document.createElement("div");
    a.className = "close";
    a.innerHTML = "X";
    a.addEventListener("click", windowClose.bind(win));
    win.appendChild(a);

    a = document.createElement("div");
    a.className = "body";
    updateInnerHTML(a, body);
    win.appendChild(a);

    document.body.appendChild(win);

    return win;
}

function windowCreate(windowType: number, objectIndex: number, tabIndex: number)
{
    let win;

    destroyWindow(windowType, objectIndex, tabIndex);

    win = windowCreateGeneric("", "");

    win.dataset["t"] = "" + windowType;
    win.dataset["i"] = "" + objectIndex;
    win.dataset["u"] = "" + tabIndex;
    win.style.left = (_mouseX + 30) + "px";
    win.style.top = (_mouseY - 200) + "px";
}
