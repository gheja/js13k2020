/*
    This code is based heavily on Xem's WebGL guide.
    https://xem.github.io/articles/webgl-guide.html

    Thanks Xem!

    And of course, on Wikipedia and mathsisfun.com
*/

type tMat4 = Float32Array;
type tMat4TransformOptions = { x:number, y:number, z:number, rx:number, ry:number, rz:number, sx:number, sy:number, sz:number };
type tMat4Transform2Options = { x:number, y:number, z:number, rx:number, ry:number, rz:number };

type tVec3 = Float32Array;
type tVec4 = Float32Array;

function F32A(x: Array<number>|Float32Array): Float32Array
{
    return new Float32Array(x);
}

// Create an identity mat4
function mat4Identity(): tMat4
{
    return F32A([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

// Compute the multiplication of two mat4
function mat4MulMat4(a: tMat4, b: tMat4): tMat4
{
    let i, ai0, ai1, ai2, ai3;
    let c = new Float32Array(16);
    for (i = 0; i < 4; i++)
    {
        ai0 = a[i];
        ai1 = a[i + 4];
        ai2 = a[i + 8];
        ai3 = a[i + 12];
        c[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
        c[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
        c[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
        c[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return c;
}

// Create a perspective matrix
// options: fov, aspect, near, far
function mat4Perspective(fov: number, aspect: number, near: number, far: number): tMat4
{
    let f = 1 / Math.tan(fov);
    let nf = 1 / (near - far);
    return F32A([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * near * far) * nf, 0
    ]);
}

// Create a perspective matrix v2
function mat4Perspective2(aspect: number): tMat4
{
    let f = 1.83; // == 1 / Math.tan(0.5)
    let nf = 1 / (WEBGL_NEAR - WEBGL_FAR);
    return F32A([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (WEBGL_FAR + WEBGL_NEAR) * nf, -1,
        0, 0, (2 * WEBGL_NEAR * WEBGL_FAR) * nf, 0
    ]);
}
// Transform a mat4
// options: x/y/z (translate), rx/ry/rz (rotate), sx/sy/sz (scale)
function mat4Transform(m: tMat4, options: tMat4TransformOptions): tMat4
{
    let out = F32A(m);

    // Translate
    out[12] += out[0] * options.x + out[4] * options.y + out[8] * options.z;
    out[13] += out[1] * options.x + out[5] * options.y + out[9] * options.z;
    out[14] += out[2] * options.x + out[6] * options.y + out[10] * options.z;
    out[15] += out[3] * options.x + out[7] * options.y + out[11] * options.z;

    // Rotate
    out.set(mat4MulMat4(out, F32A([1, 0, 0, 0, 0, Math.cos(options.rx), Math.sin(options.rx), 0, 0, -Math.sin(options.rx), Math.cos(options.rx), 0, 0, 0, 0, 1])));
    out.set(mat4MulMat4(out, F32A([Math.cos(options.ry), 0, -Math.sin(options.ry), 0, 0, 1, 0, 0, Math.sin(options.ry), 0, Math.cos(options.ry), 0, 0, 0, 0, 1])));
    out.set(mat4MulMat4(out, F32A([Math.cos(options.rz), Math.sin(options.rz), 0, 0, -Math.sin(options.rz), Math.cos(options.rz), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])));

    // Scale
    out[0] *= options.sx;
    out[1] *= options.sx;
    out[2] *= options.sx;
    out[3] *= options.sx;

    out[4] *= options.sy;
    out[5] *= options.sy;
    out[6] *= options.sy;
    out[7] *= options.sy;

    out[8] *= options.sz;
    out[9] *= options.sz;
    out[10] *= options.sz;
    out[11] *= options.sz;

    return out;
}

// Transform a mat4
function mat4Transform2(m: tMat4, options: tMat4Transform2Options): tMat4
{
    let out = F32A(m);

    // Translate
    out[12] += out[0] * options.x + out[4] * options.y + out[8] * options.z;
    out[13] += out[1] * options.x + out[5] * options.y + out[9] * options.z;
    out[14] += out[2] * options.x + out[6] * options.y + out[10] * options.z;
    out[15] += out[3] * options.x + out[7] * options.y + out[11] * options.z;

    // Rotate
    out.set(mat4MulMat4(out, F32A([1, 0, 0, 0, 0, Math.cos(options.rx), Math.sin(options.rx), 0, 0, -Math.sin(options.rx), Math.cos(options.rx), 0, 0, 0, 0, 1])));
    out.set(mat4MulMat4(out, F32A([Math.cos(options.ry), 0, -Math.sin(options.ry), 0, 0, 1, 0, 0, Math.sin(options.ry), 0, Math.cos(options.ry), 0, 0, 0, 0, 1])));
    out.set(mat4MulMat4(out, F32A([Math.cos(options.rz), Math.sin(options.rz), 0, 0, -Math.sin(options.rz), Math.cos(options.rz), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])));

    return out;
}
// Get the transposed of a mat4
function mat4Transpose(m: tMat4): tMat4
{
    return F32A([
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ]);
}

// Get the inverse of a mat4
// The mat4 is not modified, a new mat4 is returned
function mat4Inverse(m: tMat4): tMat4
{
    let inv, det, i;

    inv = F32A( [
         m[5]*m[10]*m[15]  - m[5]*m[11]*m[14]  - m[9]*m[6]*m[15]  + m[9]*m[7]*m[14]  + m[13]*m[6]*m[11]  - m[13]*m[7]*m[10],
        -m[1]*m[10]*m[15]  + m[1]*m[11]*m[14]  + m[9]*m[2]*m[15]  - m[9]*m[3]*m[14]  - m[13]*m[2]*m[11]  + m[13]*m[3]*m[10],
         m[1]*m[6]*m[15]   - m[1]*m[7]*m[14]   - m[5]*m[2]*m[15]  + m[5]*m[3]*m[14]  + m[13]*m[2]*m[7]   - m[13]*m[3]*m[6],
        -m[1]*m[6]*m[11]   + m[1]*m[7]*m[10]   + m[5]*m[2]*m[11]  - m[5]*m[3]*m[10]  - m[9]*m[2]*m[7]    + m[9]*m[3]*m[6],
        -m[4]*m[10]*m[15]  + m[4]*m[11]*m[14]  + m[8]*m[6]*m[15]  - m[8]*m[7]*m[14]  - m[12]*m[6]*m[11]  + m[12]*m[7]*m[10],
         m[0]*m[10]*m[15]  - m[0]*m[11]*m[14]  - m[8]*m[2]*m[15]  + m[8]*m[3]*m[14]  + m[12]*m[2]*m[11]  - m[12]*m[3]*m[10],
        -m[0]*m[6]*m[15]   + m[0]*m[7]*m[14]   + m[4]*m[2]*m[15]  - m[4]*m[3]*m[14]  - m[12]*m[2]*m[7]   + m[12]*m[3]*m[6],
         m[0]*m[6]*m[11]   - m[0]*m[7]*m[10]   - m[4]*m[2]*m[11]  + m[4]*m[3]*m[10]  + m[8]*m[2]*m[7]    - m[8]*m[3]*m[6],
         m[4]*m[9]*m[15]   - m[4]*m[11]*m[13]  - m[8]*m[5]*m[15]  + m[8]*m[7]*m[13]  + m[12]*m[5]*m[11]  - m[12]*m[7]*m[9],
        -m[0]*m[9]*m[15]   + m[0]*m[11]*m[13]  + m[8]*m[1]*m[15]  - m[8]*m[3]*m[13]  - m[12]*m[1]*m[11]  + m[12]*m[3]*m[9],
         m[0]*m[5]*m[15]   - m[0]*m[7]*m[13]   - m[4]*m[1]*m[15]  + m[4]*m[3]*m[13]  + m[12]*m[1]*m[7]   - m[12]*m[3]*m[5],
        -m[0]*m[5]*m[11]   + m[0]*m[7]*m[9]    + m[4]*m[1]*m[11]  - m[4]*m[3]*m[9]   - m[8]*m[1]*m[7]    + m[8]*m[3]*m[5],
        -m[4]*m[9]*m[14]   + m[4]*m[10]*m[13]  + m[8]*m[5]*m[14]  - m[8]*m[6]*m[13]  - m[12]*m[5]*m[10]  + m[12]*m[6]*m[9],
         m[0]*m[9]*m[14]   - m[0]*m[10]*m[13]  - m[8]*m[1]*m[14]  + m[8]*m[2]*m[13]  + m[12]*m[1]*m[10]  - m[12]*m[2]*m[9],
        -m[0]*m[5]*m[14]   + m[0]*m[6]*m[13]   + m[4]*m[1]*m[14]  - m[4]*m[2]*m[13]  - m[12]*m[1]*m[6]   + m[12]*m[2]*m[5],
         m[0]*m[5]*m[10]   - m[0]*m[6]*m[9]    - m[4]*m[1]*m[10]  + m[4]*m[2]*m[9]   + m[8]*m[1]*m[6]    - m[8]*m[2]*m[5]
    ]);

    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (!det) return m;

    det = 1 / det;

    for (i = 0; i < 16; i++)
    {
        inv[i] *= det;
    }
    return inv;
}

/*
function vec4Zero()
{
    return F32A([ 0, 0, 0, 0 ]);
}
*/

function mat4MulVec3(m: tMat4, v: tVec3): tVec4
{
    return F32A([
        m[0]*v[0]  + m[1]*v[1]  + m[2]*v[2]  + m[3],
        m[4]*v[0]  + m[5]*v[1]  + m[6]*v[2]  + m[7],
        m[8]*v[0]  + m[9]*v[1]  + m[10]*v[2] + m[11],
        m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]
    ]);
}

/*
function mat4MulVec4(m: tMat4, v: tVec4): tVec4
{
    return F32A([
        m[0]*v[0]  + m[1]*v[1]  + m[2]*v[2]  + m[3]*v[3],
        m[4]*v[0]  + m[5]*v[1]  + m[6]*v[2]  + m[7]*v[3],
        m[8]*v[0]  + m[9]*v[1]  + m[10]*v[2] + m[11]*v[3],
        m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3]
    ]);
}
*/

function vec3Minus(a: tVec3, b: tVec3): tVec3
{
    return F32A([ a[0] - b[0], a[1] - b[1], a[2] - b[2] ]);
}

function vec3Plus(a: tVec3, b: tVec3): tVec3
{
    return F32A([ a[0] + b[0], a[1] + b[1], a[2] + b[2] ]);
}

function vec3Cross(a: tVec3, b: tVec3): tVec3
{
    return F32A([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
}

function vec3Dot(a: tVec3, b: tVec3): number
{
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vec3MulScalar(a: tVec3, b: number): tVec3
{
    return F32A([ a[0] * b, a[1] * b, a[2] * b ]);
}

// Based on Möller–Trumbore intersection algorithm
// https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
// TODO: optimize for size
function getLineTriangleIntersection(lineOrigin: tVec3, lineVector: tVec3, p1: tVec3, p2: tVec3, p3: tVec3): tVec3
{
    let edge1 = vec3Minus(p2, p1);
    let edge2 = vec3Minus(p3, p1);

    let h = vec3Cross(lineVector, edge2);
    let a = vec3Dot(edge1, h);

    if (a > -EPSILON && a < EPSILON)
    {
        // This ray is parallel to this triangle.
        return null;
    }

    let f = 1 / a;
    let s = vec3Minus(lineOrigin, p1);
    let u = f * vec3Dot(s, h);

    if (u < 0.0 || u > 1.0)
    {
        // ?
        return null;
    }

    let q = vec3Cross(s, edge1);
    let v = f * vec3Dot(lineVector, q);

    if (v < 0.0 || u + v > 1.0)
    {
        // ?
        return null;
    }

    // At this stage we can compute t to find out where the intersection point is on the line.
    let t = f * vec3Dot(edge2, q);

    if (t <= EPSILON)
    {
        // This means that there is a line intersection but not a ray intersection.
        return null;
    }

    return vec3Plus(lineOrigin, vec3MulScalar(lineVector, t));
}
