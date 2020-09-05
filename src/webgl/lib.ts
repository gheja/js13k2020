function hsla2rgba(h: number, s: number, l: number, a: number): tRgbaArray
{
    // thanks Mohsen! https://stackoverflow.com/a/9493060/460571
    let p, q, r, g, b;

    function convert(p, q, t)
    {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 3/6) return q;
        if (t < 4/6) return p + (q - p) * 6 * (4/6 - t);
        return p
    }

    if (l < 0.5)
    {
        q = l * (1 + s);
    }
    else
    {
        q = l + s - l * s;
    }

    p = 2 * l - q;

    r = Math.floor(convert(p, q, h + 1/3) * 255);
    g = Math.floor(convert(p, q, h) * 255);
    b = Math.floor(convert(p, q, h - 1/3) * 255);

    return [ r, g, b, a ];
}

// Convert deg in radians
function deg2rad(angle): number
{
    return Math.PI * angle / 180;
}
