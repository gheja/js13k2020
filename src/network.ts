type tNetworkStop = {
};

type tNetworkNode = {
    position: tPoint3D,
    locked: boolean,
    stop: tNetworkStop,
    highlighted: boolean,
    webglGfxObject: any,
    angle: number,
    edge1: tPoint3D,
    edge2: tPoint3D
};

type tNetworkEdge = {
    node1: tNetworkNode,
    node2: tNetworkNode,
    locked: boolean,
    highlighted: boolean,
};

class Network
{
    nodes: Array<tNetworkNode>;
    edges: Array<tNetworkEdge>;

    constructor()
    {
        this.nodes = [];
        this.edges = [];
    }

    addNode(position: tPoint3D, locked: boolean, stop: tNetworkStop=null)
    {
        let a: tNetworkNode;

        a = {
            position: position,
            locked: locked,
            stop: stop,
            webglGfxObject: _gfx.createObject(_gfx.shapes[SHAPE_ROAD_NODE_INDEX]),
            highlighted: false,
            angle: null,
        };

        a.webglGfxObject.x = position[0];
        a.webglGfxObject.y = position[1];
        a.webglGfxObject.z = position[2];

        this.nodes.push(a);

        return a;
    }

    addEdge(node1: tNetworkNode, node2: tNetworkNode, locked: boolean)
    {
        this.edges.push({
            node1: node1,
            node2: node2,
            locked: locked,
            highlighted: false
        });

        return this.edges[this.edges.length - 1];
    }

    pickNode(position: tPoint3D, highlight: boolean)
    {
        if (highlight)
        {
            this.nodes.forEach((node) => node.highlighted = false);
        }

        this.nodes.forEach((node) => {
            if (distance3D(node.position, position) < 0.5)
            {
                node.highlighted = true;
                return node;
            }
        });

        return null;
    }

    rebuild()
    {
        this.nodes.forEach((a) => a.angle = null);

        this.edges.forEach((edge) => {
            if (edge.node2.angle === null)
            {
                edge.node2.angle = getAngle2D(edge.node1.position, edge.node2.position);
            }
        });

        this.edges.forEach((edge) => {
            if (edge.node1.angle === null)
            {
                edge.node1.angle = edge.node2.angle;
            }
        });

        this.nodes.forEach((node) => {
            node.edge1 = [
                node.position[0] + Math.cos(node.angle - Math.PI/2) * ROAD_WIDTH / 2,
                node.position[1] + Math.sin(node.angle - Math.PI/2) * ROAD_WIDTH / 2,
                node.position[2] + 0.1
            ];

            node.edge2 = [
                node.position[0] + Math.cos(node.angle + Math.PI/2) * ROAD_WIDTH / 2,
                node.position[1] + Math.sin(node.angle + Math.PI/2) * ROAD_WIDTH / 2,
                node.position[2] + 0.1
            ];
        })

        let vertices: Array<number>;
        let indices: Array<number>;
        let colors: Array<number>;
        let i: number;

        vertices = [];
        indices = [];
        colors = [];
        i = 0;

        this.edges.forEach((edge) => {
            vertices.push(...edge.node2.edge2, ...edge.node1.edge2, ...edge.node1.edge1, ...edge.node2.edge2, ...edge.node1.edge1, ...edge.node2.edge1);
            indices.push(i++, i++, i++, i++, i++, i++);
            colors.push(1,1,1,1,1,1);
        });

        // shape 4, object 3
        _gfx.destroyShape(4);
        _gfx.shapes[4] = _gfx.buildShape3(new Float32Array(vertices), new Uint16Array(indices), new Uint8Array(colors));
        _gfx.objects[3].shape = _gfx.shapes[4];

        console.log(vertices);
    }
}