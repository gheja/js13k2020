"use strict";

let _tooltipDom;

// TODO: google closure compiler renames properties of domobject.dataset, now accessing it as array until fixed

function tooltipSet(s: string)
{
    if (!s)
    {
        _tooltipDom.style.display = "none";
    }
    else
    {
        _tooltipDom.style.display = "block";
        _tooltipDom.innerHTML = s;
    }
}

function tooltipShow(e)
{
    _mouseOverToolbar = true;
    tooltipSet((this.dataset["tooltip"] || "") + (this.classList.contains("button-disabled") ? " (locked)" : ""));
}

function tooltipHide(e)
{
    _mouseOverToolbar = false;
    tooltipSet();
}

function tooltipUpdate()
{
    _tooltipDom.style.left = (_mouseX - 20) + "px";
    _tooltipDom.style.top = (_mouseY + 40) + "px";
}

function initTooltip()
{
    let a: HTMLElement;

    _tooltipDom = document.getElementById("tooltip");

    for (a of document.querySelectorAll<HTMLElement>("*"))
    {
        if (a.dataset["tooltip"])
        {
            a.addEventListener("mouseover", tooltipShow.bind(a));
            a.addEventListener("mouseout", tooltipHide.bind(a));
        }
    }
}
