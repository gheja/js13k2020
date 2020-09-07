/*
function distance3D(p1: tPoint3D, p2: tPoint3D)
{
    // manhattan distance to speed things up
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) + Math.abs(p1.z - p2.z);
}
*/
function distance3D(p1: tPoint3D, p2: tPoint3D)
{
    // manhattan distance to speed things up
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]);
}
