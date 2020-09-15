function distance3D(p1: tPoint3D, p2: tPoint3D): number
{
    // manhattan distance to speed things up
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]);
}

function getAngle2D(p1: tPoint3D, p2: tPoint3D): number
{
    return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

function offset3D(p: tPoint3D, angle: number, distance: number, height: number): tPoint3D
{
    return F32A([
        p[0] + Math.cos(angle + Math.PI/2) * distance,
        p[1] + Math.sin(angle + Math.PI/2) * distance,
        p[2] + height
    ]);
}

function goTowards3D(p1: tPoint3D, p2: tPoint3D, distance: number)
{
    let angle, n;

    angle = getAngle2D(p1, p2);
    n = Math.min(distance, distance3D(p1, p2));

    return F32A([
        p1[0] + Math.cos(angle) * n,
        p1[1] + Math.sin(angle) * n,
        p2[2],
    ]);
}

function createGoodList()
{
    // TODO: optimize for size? remove this and use "|| 0" where needed as that saves ~16 bytes from final ZIP
    // note: this results even bigger ZIP: return new Array(GOOD_MAX).fill(0);
    return [0,0,0,0,0,0,0,0,0,0];
}

function destroyThis()
{
    (this as HTMLDivElement).parentNode.removeChild(this);
}

function createBubble(text: string)
{
    let a;

    a = document.createElement("div");
    a.className = "bubble";
    a.innerHTML = text;
    window.setTimeout(destroyThis.bind(a), 5000);
    document.getElementById("bubbles").appendChild(a);
}

function clamp(x, min, max)
{
    return Math.min(Math.max(x, min), max);
}

// only updates the innerHTML of "obj" if "text" is different
function updateInnerHTML(obj: HTMLElement, text: string)
{
    // as browsers parse and change the innerHTML we store it in an extra parameter
    // so we can prevent unneeded updates
    if (obj.dataset["_x"] != text)
    {
        obj.dataset["_x"] = text;
        obj.innerHTML = text;
    }
}

function getTime(ticks)
{
    let x, d, h, m, s;

    // 2.5 sec = 1 day;

    x = ticks; // * (1440 / (2.5 / (1 / 60)));

    d = Math.floor(x / (60 * 24)) + 1;
    h = Math.floor((x % (60 * 24)) / 60);
    m = 0;

    s = Math.floor(_time / 1000);

    return `Day ${d} ${h}:00 [${s} s]`;
}

function loan1(x)
{
    _stats[STAT_LOAN_TAKEN] += x;
}

function loan2(x)
{
    _stats[STAT_LOAN_REPAID] += x;
}

function moneyFormat(x)
{
    return "$" + x.toLocaleString("en-US");
}

function removeFromArray(array: Array<any>, item: any)
{
    let i;

    for (i=array.length-1; i>= 0; i--)
    {
        if (array[i] === item)
        {
            array.splice(i, 1);
        }
    }
}

function pickStation(position: tPoint3D)
{
    let a;

    for (a of _stations)
    {
        if (distance3D(a.position, position) < 5)
        {
            return a;
        }
    }

    return null;
}

function highlightStaion(x)
{
}

function tryToSpend(amount: number, category: number)
{
    if (_creditsBalance < amount)
    {
        windowCreateGeneric("Not enough money", `It'd cost ${moneyFormat(amount)} but you can't afford that. Check with the Bank for loans.`);
        return false;
    }

    _stats[category] += amount;

    createBubble(`💵 ${moneyFormat(-amount)}`);

    return true;
}

function newIncome(amount: number)
{
    increaseStat(STAT_CREDITS, amount);
    createBubble(`💵 ${moneyFormat(amount)}`);
}
