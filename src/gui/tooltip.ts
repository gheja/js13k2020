"use strict";

// TODO: google closure compiler renames properties of domobject.dataset, now accessing it as array until fixed

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

function initTooltip()
{
    let a: HTMLElement;

    for (a of document.querySelectorAll<HTMLElement>("*"))
    {
        if (a.dataset["tooltip"])
        {
            a.addEventListener("mouseover", tooltipShow.bind(a));
            a.addEventListener("mouseout", tooltipHide.bind(a));
        }
    }
}
