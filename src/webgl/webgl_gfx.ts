/*
    This code started out from Xem's WebGL guide.
    https://xem.github.io/articles/webgl-guide.html

    Thanks Xem!
*/

class WebglGfx
{
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    objects: Array<any>;
    shapes: Array<any>;
    cam: any;
    cameraMatrix: tMat4;
    viewMatrix: tMat4;
    projectionMatrix: tMat4;
    viewProjectionMatrix: tMat4;
    cursorScreenPosition: Array<number>;
    cursorWorldPosition: tVec3;
    program: WebGLProgram;

    constructor(id: string)
    {
        let vshader: string;
        let fshader: string;

        this.canvas = (document.getElementById(id) as HTMLCanvasElement);
        this.gl = (this.canvas.getContext("webgl") as WebGLRenderingContext);

        vshader = `attribute vec4 p,c,n;uniform mat4 m,o,i;varying vec4 vc;varying vec3 vn,vp;void main(){gl_Position=m*p;vp=vec3(o*p);vn=normalize(vec3(i*n));vc=c;}`;
        fshader = `precision mediump float;uniform vec3 lc,lp,al;varying vec3 vn,vp;varying vec4 vc;void main(){vec3 l=normalize(lp-vp);float n=max(dot(l,vn),0.0);vec3 q=lc*vc.rgb*n+al*vc.rgb;gl_FragColor=vec4(q,1.0);}`;
        this.program = this.compile(vshader, fshader);

        this.cam = {
            x: 0,
            y: 0,
            z: 10,
            rx: 0,
            ry: 0,
            rz: 0
        };

        this.cursorScreenPosition = [ 0, 0 ];

        this.gl.clearColor(0, 0, 0.2, 1);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        // Set the point light color and position
        let lightColor = this.gl.getUniformLocation(this.program, 'lc');
        this.gl.uniform3f(lightColor, 1, 1, 1);

        let lightPosition = this.gl.getUniformLocation(this.program, 'lp');
        this.gl.uniform3f(lightPosition, 3, -20, 20);

        // Set the ambient light color
        let ambientLight = this.gl.getUniformLocation(this.program, 'al');
        this.gl.uniform3f(ambientLight, 0.1, 0.1, 0.1);

        this.shapes = [];
        this.addShape(SHAPE_PLANE);
        this.addShape(SHAPE_TRAIN1);
        this.addShape(SHAPE_CURSOR);
        this.addShape(SHAPE_ROAD_NODE);

        this.objects = [];
        this.createObject(this.shapes[0]);
        this.createObject(this.shapes[1]);
        this.createObject(this.shapes[2]);

        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    // Compile a WebGL program from a vertex shader and a fragment shader
    compile(vshader: string, fshader: string): WebGLProgram
    {
        let vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vs, vshader);
        this.gl.compileShader(vs);

        let fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fs, fshader);
        this.gl.compileShader(fs);

        let program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        this.gl.useProgram(program);

        console.log('vertex shader:', this.gl.getShaderInfoLog(vs) || 'OK');
        console.log('fragment shader:', this.gl.getShaderInfoLog(fs) || 'OK');
        console.log('program:', this.gl.getProgramInfoLog(program) || 'OK');

        return program;
    }

    resize()
    {
        let width;
        let height;

        width = this.canvas.clientWidth;
        height = this.canvas.clientHeight;

        if (this.canvas.width != width || this.canvas.height != height)
        {
            this.canvas.width = width;
            this.canvas.height = height;

            // maybe this is the correct one?
            // this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.gl.viewport(0, 0, width, height);
            this.projectionMatrix = mat4Perspective2(width / height);
        }
    }

    updateCursorPosition()
    {
        // TODO: rewrite/optimize this
        
        let a, b, c;

        a = this.unproject(F32A([ this.cursorScreenPosition[0], this.cursorScreenPosition[1], 0 ]));
        b = this.unproject(F32A([ this.cursorScreenPosition[0], this.cursorScreenPosition[1], 1 ]));

        if (!a || !b)
        {
            return;
        }

        // a huge dummy triangle instead of ground for now

        c = getLineTriangleIntersection(
            a,
            vec3Minus(b, a),
            F32A([ 0, 2000, 0 ]),
            F32A([ -2000, -2000, 0 ]),
            F32A([ 2000, -2000, 0 ])
        );

        if (!c)
        {
            return;
        }

        this.cursorWorldPosition = c;

        this.objects[2].x = c[0];
        this.objects[2].y = c[1];
        this.objects[2].z = c[2];
    }

    createBuffer(x: any, type: number)
    {
        let a;

        a = this.gl.createBuffer();
        this.gl.bindBuffer(type, a);
        this.gl.bufferData(type, x, this.gl.STATIC_DRAW);

        return a;
    }

    calculateNormals(vertices: Float32Array, indices: Uint16Array): Float32Array
    {
        let normals: Float32Array;
        let i: number;
        let ia: number, ib: number, ic: number;
        let va, vb, vc;
        let b;
        let edgeAB, edgeAC;

        function add(a: Float32Array, i: number, b: Float32Array)
        {
            a[i] += b[0];
            a[i + 1] += b[1];
            a[i + 2] += b[2];
        }

        normals = new Float32Array(vertices.length);

        // Add all face normals
        for (i = 0; i < indices.length; i += 3)
        {
            ia = indices[i] * 3;
            ib = indices[i + 1] * 3;
            ic = indices[i + 2] * 3;
            va = [vertices[ia], vertices[ia + 1], vertices[ia + 2]];
            vb = [vertices[ib], vertices[ib + 1], vertices[ib + 2]];
            vc = [vertices[ic], vertices[ic + 1], vertices[ic + 2]];
            edgeAB = vec3Minus(vb, va);
            edgeAC = vec3Minus(vc, va);
            b = vec3Cross(edgeAB, edgeAC);
            add(normals, ia, b);
            add(normals, ib, b);
            add(normals, ic, b);
        }

        // Normalize the vectors
        for (i = 0; i < normals.length; i += 3)
        {
            b = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2);

            if (b != 0)
            {
                normals[i] /= b;
                normals[i + 1] /= b;
                normals[i + 2] /= b;
            }
        }

        return normals;
    }

    buildShape(input: tShapeDefinition): tShapeWebglDefinition
    {
        let i: number;
        let j: number;
        let l: number;
        let c: number;
        let n: number;
        let z1: number, z2: number;
        let autoclose: boolean;
        let scale1: number, scale2: number;
        let sides: number;
        let slice_height: number;
        let mirror_x: boolean;
        let points: Array<Array<number>>;
        let lastPoints: Array<Array<number>>;

        let vertices: Array<number>;
        let indices: Array<number>;
        let colors: Array<number>;

        let copying: boolean;
        let copy_begin, copy_end, copy_return;

        scale2 = 1;
        slice_height = 1;
        vertices = [];
        indices = [];
        colors = [];
        points = [];
        autoclose = true;
        mirror_x = false;
        copying = false;

        let dx, dy, dz, rx, ry, rz;

        dx = dy = dz = rx = ry = rz = 0;

        function createTriangleStrip()
        {
            let i:number;
            let j: number;

            z1 = z2;
            z2 += slice_height;

            if (scale1 === undefined)
            {
                scale1 = scale2;
            }

            for (i = 0; i < points.length - 1; i++)
            {
                vertices.push(
                    points[i][0] * scale2 + dx, points[i][1] * scale2 + dy, z2,
                    lastPoints[i][0] * scale1 + dx, lastPoints[i][1] * scale1 + dy, z1,
                    points[i + 1][0] * scale2 + dx, points[i + 1][1] * scale2 + dy, z2,

                    points[i + 1][0] * scale2 + dx, points[i + 1][1] * scale2 + dy, z2,
                    lastPoints[i][0] * scale1 + dx, lastPoints[i][1] * scale1 + dy, z1,
                    lastPoints[i + 1][0] * scale1 + dx, lastPoints[i + 1][1] * scale1 + dy, z1
                );

                for (j = 0; j < 6; j++)
                {
                    // colors.push(...colorPalette[c]);
                    colors.push(c);
                }

                indices.push(n++, n++, n++, n++, n++, n++);
            }

            scale1 = scale2;
        }

        i = 0;
        n = 0;
        z2 = 0;

        while (i < input.length)
        {
            switch (input[i++])
            {
                case SHAPE_SET_SCALE:
                    scale2 = input[i++];
                break;

                case SHAPE_SET_COLOR:
                    c = input[i++];
                break;

                case SHAPE_SET_SIDES:
                    sides = input[i++];
                    points = [];
                break;

                case SHAPE_SET_AUTOCLOSE:
                    autoclose = !!input[i++];
                break;

                case SHAPE_SLICE_SET_HEIGHT:
                    slice_height = input[i++];
                break;

                case SHAPE_SET_MIRROR_X:
                    mirror_x = !!input[i++];
                break;

                case SHAPE_SLICE_POINTS:
                    lastPoints = points.slice();
                    points = [];

                    for (j = 0; j < sides; j++)
                    {
                        points.push([input[i++], input[i++]]);
                    }

                    if (mirror_x)
                    {
                        for (j = points.length - 1; j >= 0; j--)
                        {
                            points.push([points[j][0] * -1, points[j][1]]);
                        }
                    }
                    else if (autoclose)
                    {
                        points.push(points[0]);
                    }

                    if (lastPoints.length > 0)
                    {
                        createTriangleStrip();
                    }
                break;

                case SHAPE_SLICE_REPEAT:
                    lastPoints = points.slice();

                    createTriangleStrip();
                break;

                case SHAPE_SLICE_CIRCLE:
                    points = [];

                    sides = input[i++];
                    l = input[i++];

                    for (j = 0; j <= sides; j++)
                    {
                        points.push([Math.cos(j / sides * Math.PI * 2) * l, Math.sin(j / sides * Math.PI * 2) * l]);
                    }
                break;

                case SHAPE_COPY_BEGIN:
                    copy_begin = i;
                break;

                case SHAPE_COPY_END:
                    copy_end = i;

                    if (copying)
                    {
                        copying = false;
                        i = copy_return;
                    }
                break;

                case SHAPE_COPY_PASTE:
                    copying = true;
                    copy_return = i;
                    i = copy_begin;
                break;

                case SHAPE_GOTO:
                    // NOTE: tscc in current build script compiles to <ES6 so this assignment becomes ugly and long
                    // [ dx, dy, dz, rx, ry, rz ] = [ input[i++], input[i++], input[i++], input[i++], input[i++], input[i++] ];

                    dx = input[i++];
                    dy = input[i++];
                    dz = input[i++];
                    rx = input[i++];
                    ry = input[i++];
                    rz = input[i++];

                    scale2 = undefined;
                    scale1 = undefined;

                    z1 = z2 = dz;
                break;
            }
        }

        return [ F32A(vertices), new Uint16Array(indices), new Uint8Array(colors) ];
    }

    // should be merged with addShape() but the editor needs to build a shape and
    // not add to this.shapes
    buildShape2(input: tShapeDefinition)
    {
        function fuzzyHsla(x: tHslaArray, y: number): tHslaArray
        {
            return [
                (x[0] + 1 + y * (Math.random() - 0.5)) % 1,
                x[1],
                x[2],
                x[3]
            ];
        }

        let vertices: Float32Array;
        let indices: Uint16Array;
        let colors: Uint8Array;
        let colors2: Uint8Array;
        let i, b;

        [ vertices, indices, colors ] = this.buildShape(input);

        colors2 = new Uint8Array(colors.length * 4);

        // per face
        for (i = 0; i < colors.length; i += 6)
        {
            // @ts-ignore
            b = hsla2rgba(...COLOR_PALETTE[colors[i]], 1);
            colors2.set(b, i * 4);
            colors2.set(b, (i + 1) * 4);
            colors2.set(b, (i + 2) * 4);
            colors2.set(b, (i + 3) * 4);
            colors2.set(b, (i + 4) * 4);
            colors2.set(b, (i + 5) * 4);
        }

        return {
            b_p: this.createBuffer(vertices, this.gl.ARRAY_BUFFER),
            b_i: this.createBuffer(indices, this.gl.ELEMENT_ARRAY_BUFFER),
            b_n: this.createBuffer(this.calculateNormals(vertices, indices), this.gl.ARRAY_BUFFER),
            b_c: this.createBuffer(colors2, this.gl.ARRAY_BUFFER),
            indices_length: indices.length
        };
    }

    addShape(input: tShapeDefinition)
    {
        this.shapes.push(this.buildShape2(input));

        return this.shapes[this.shapes.length - 1];
    }

    destroyShape(index)
    {
        let shape;

        shape = this.shapes[index];

        this.gl.deleteBuffer(shape.b_p);
        this.gl.deleteBuffer(shape.b_i);
        this.gl.deleteBuffer(shape.b_n);
        this.gl.deleteBuffer(shape.b_c);
        this.shapes[index] = null;
    }

    createObject(shape)
    {
        this.objects.push({
            shape: shape,
            rx: 0,
            ry: 0,
            rz: 0,
            x: 0,
            y: 0,
            z: 0
        });

        return this.objects[this.objects.length - 1];
    }

    render()
    {
        let obj;
        let modelMatrix: Float32Array;
        let mvpMatrix: Float32Array;
        let inverseTransposeMatrix: Float32Array;
/*
        // TODO: tscc is not aware of some WebGL types - replacing them here
        let a_position: GLint;
        let a_normal: GLint;
        let a_color: GLint;
*/
        let a_position: number;
        let a_normal: number;
        let a_color: number;
        let u_model: WebGLUniformLocation;
        let u_mvp: WebGLUniformLocation;
        let u_inverseTranspose: WebGLUniformLocation;

        this.cameraMatrix = mat4Transform2(mat4Identity(), this.cam);
        this.viewMatrix = mat4Inverse(this.cameraMatrix);
        this.viewProjectionMatrix = mat4MulMat4(this.projectionMatrix, this.viewMatrix);

        this.updateCursorPosition();

        this.gl.useProgram(this.program);

        a_position = this.gl.getAttribLocation(this.program, "p");
        a_normal = this.gl.getAttribLocation(this.program, "n");
        a_color = this.gl.getAttribLocation(this.program, "c");

        u_model = this.gl.getUniformLocation(this.program, 'o');
        u_mvp = this.gl.getUniformLocation(this.program, 'm');
        u_inverseTranspose = this.gl.getUniformLocation(this.program, 'i');

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (obj of this.objects)
        {
            modelMatrix = mat4Identity();
            // obj has x, y, z, rx, ry, rz just like transform() requires in options
            modelMatrix = mat4Transform2(modelMatrix, obj);
            this.gl.uniformMatrix4fv(u_model, false, modelMatrix);

            mvpMatrix = mat4MulMat4(this.viewProjectionMatrix, modelMatrix);
            this.gl.uniformMatrix4fv(u_mvp, false, mvpMatrix);

            inverseTransposeMatrix = mat4Transpose(mat4Inverse(modelMatrix));
            this.gl.uniformMatrix4fv(u_inverseTranspose, false, inverseTransposeMatrix);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.shape.b_p);
            this.gl.vertexAttribPointer(a_position, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(a_position);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.shape.b_n);
            this.gl.vertexAttribPointer(a_normal, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(a_normal);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.shape.b_c);
            this.gl.vertexAttribPointer(a_color, 4, this.gl.UNSIGNED_BYTE, true, 0, 0);
            this.gl.enableVertexAttribArray(a_color);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj.shape.b_i);
            this.gl.drawElements(this.gl.TRIANGLES, obj.shape.indices_length, this.gl.UNSIGNED_SHORT, 0);
        }
    }

    // based on glhUnProjectf()
    // https://www.khronos.org/opengl/wiki/GluProject_and_gluUnProject_code
    unproject(input: tVec3): tVec3
    {
        let output: tVec4;

        output = mat4MulVec3(mat4Transpose(mat4Inverse(this.viewProjectionMatrix)), input);

        if (output[3] == 0)
        {
            return null;
        }

        return vec3MulScalar(output, 1 / output[3]);
    }

    onMouseMove(event: MouseEvent)
    {
        this.cursorScreenPosition = [
            (event.clientX / this.canvas.clientWidth) * 2 - 1,
            - ((event.clientY / this.canvas.clientHeight) * 2 - 1)
        ];
    }
}
