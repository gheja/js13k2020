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

                if (obj.schedule.length == 0)
                {
                    s = "nowhere";
                }
                else
                {
                    s = obj.schedule[obj.scheduleIndex].station.title;
                }

                if (obj.stopped)
                {
                    bodyText += "Stopped."
                }
                else
                {
                    switch (obj.state)
                    {
                        case VEHICLE_STATE_TRAVELLING:
                        case VEHICLE_STATE_LEAVING:
                        case VEHICLE_STATE_ARRIVING:
                        case VEHICLE_STATE_ARRIVED:
                            bodyText += `Heading to ${s}`;
                        break;

                        case VEHICLE_STATE_UNLOADING:
                            bodyText += `Unloading`;
                        break;

                        case VEHICLE_STATE_LOADING:
                            bodyText += `Loading`;
                        break;

                        case VEHICLE_STATE_DEPOT:
                            bodyText += `Servicing`;
                        break;
                    }
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
                if (obj.schedule.length == 0)
                {
                    bodyText += "(Schedule is empty.)<br/>";
                }
                else
                {
                    obj.schedule.forEach((x, i) =>
                    {
                        bodyText +=
                            ((i == obj.scheduleIndex) ? "&raquo; " : "") +
                            `${x.station.title} [<a href="#" onclick="scheduleDelete(${obj.vehicleIndex}, ${i});">del</a>] <br/>`;
                    });
                }

                bodyText += `<a href="#" onclick="scheduleAppend(${obj.vehicleIndex});">Add</a> | `;
                bodyText += `<a href="#" onclick="scheduleSkip(${obj.vehicleIndex});">Skip</a> | `;
                bodyText += `<a href="#" onclick="vehiclePause(${obj.vehicleIndex});">` + (obj.stopped ? "Start" : "Stop") + `</a> | `;
                bodyText += `<a href="#" onclick="vehicleDepot(${obj.vehicleIndex});">Depot`;

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

            case WINDOW_TYPE_BANK:
                titleText = "Bank";

                i = _stats[STAT_LOAN_TAKEN] - _stats[STAT_LOAN_REPAID];

                bodyText += `Total loan: ${moneyFormat(i)}<br/>`;
                // TODO: implement it actually
                bodyText += `Total interest: ${moneyFormat(_creditsLoanInterestPerDay)}/day<br/>`;
                bodyText += `Loan limit: ${moneyFormat(_creditsLoanMax)}<br/>`;

                if (i < _creditsLoanMax)
                {
                    bodyText += `<a href="#" onclick="loan1(10000)">Borrow ${moneyFormat(10000)}</a><br/>`
                }

                if (i > 0 && _creditsBalance > 10000)
                {
                    bodyText += `<a href="#" onclick="loan2(10000)">Repay ${moneyFormat(10000)}<a><br/>`
                }
            break;

            case WINDOW_TYPE_BUY:
                titleText = "Buy a new vehicle";
                bodyText = "asdf";
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

function destroyAllWindowsByType(windowType: number)
{
    let win: HTMLElement;

    for (win of document.querySelectorAll<HTMLElement>(".window"))
    {
        if (win.dataset["t"] == windowType)
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

    if (windowType == WINDOW_TYPE_BUY)
    {
        // right before setting type
        destroyAllWindowsByType(WINDOW_TYPE_BUY);

        // moving over here, sorry
        win.insertBefore(_gfx2.canvas, win.querySelector(".body"));
    }

    win.dataset["t"] = "" + windowType;
    win.dataset["i"] = "" + objectIndex;
    win.dataset["u"] = "" + tabIndex;
    win.style.left = (_mouseX + 30) + "px";
    win.style.top = (_mouseY - 200) + "px";
}
