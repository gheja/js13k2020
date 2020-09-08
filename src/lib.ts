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