const NETWORK_NODE_HIGHLIGHT_NONE = 0;
const NETWORK_NODE_HIGHLIGHT_EDITED = 1;
const NETWORK_NODE_HIGHLIGHT_INVALID = 2;

type tNetworkNeighbour = {
    node: any, // it is "tNetworkNode" actually but tscc overflows
    distance: number
};

type tNetworkNode = {
    position: tPoint3D,
    locked: boolean,
    station: Station,
    webglGfxObject: any,
    highlight: number,

    // for routing:
    visited: boolean,
    totalDistance: number,
    neighbours: Array<tNetworkNeighbour>,
    previousNode: any, // it is "tNetworkNode" actually but tscc overflows
};

type tNetworkEdge = {
    node1: tNetworkNode,
    node2: tNetworkNode,
    locked: boolean,
    length: number,
};

class Network
{
    nodes: Array<tNetworkNode>;
    edges: Array<tNetworkEdge>;
    webglGfxObject: any;
    editedNode1: tNetworkNode;
    editedNode2: tNetworkNode;
    showNodes: boolean;

    constructor()
    {
        this.nodes = [];
        this.edges = [];
        this.webglGfxObject = _gfx.createObject(SHAPE_DYNAMIC_ROAD_INDEX);
        this.showNodes = false;
    }

    addNode(position: tPoint3D, locked: boolean, station: Station=null)
    {
        let a: tNetworkNode;

        a = {
            position: position,
            locked: locked,
            station: station,
            webglGfxObject: _gfx.createObject(SHAPE_ROAD_NODE_INDEX),
            visited: false,
            totalDistance: null,
            highlight: NETWORK_NODE_HIGHLIGHT_NONE,
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
            length: distance3D(node1.position, node2.position),
        });

        return this.edges[this.edges.length - 1];
    }

    deleteEdge(edge: tNetworkEdge)
    {
        removeFromArray(this.edges, edge);
    }

    deleteNode(node: tNetworkNode)
    {
        let i;

        if (node)
        {
            // TODO: delete the webgl object
            node.webglGfxObject.visible = false;

            for (i = this.edges.length - 1; i >= 0; i--)
            {
                if (this.edges[i].node1 === node || this.edges[i].node2 === node)
                {
                    this.deleteEdge(this.edges[i]);
                }
            }

            removeFromArray(this.nodes, node);
        }
    }

    pickNode(position: tPoint3D, skipLocked: boolean)
    {
        let a;

        for (a of this.nodes)
        {
            if (!(skipLocked && a.locked))
            {
                if (a !== this.editedNode2 && distance3D(a.position, position) < 2)
                {
                    return a;
                }
            }
        }

        return null;
    }

    getNearestNode(station: Station): tNetworkNode
    {
        let node: tNetworkNode;

        for (node of this.nodes)
        {
            // TODO: not the nearest but the first in order
            if (node.station == station)
            {
                return node;
            }
        }

        return null;
    }

    editStart()
    {
        this.showNodes = true;
        this.editedNode1 = null;
        this.editedNode2 = null;
        this.rebuildGfx();
    }

    editPick(x: tNetworkNode)
    {
        this.editedNode1 = x;
        this.editedNode2 = this.addNode(x.position, false, null);
        this.addEdge(this.editedNode1, this.editedNode2, false);
    }

    editUpdate()
    {
        let x: tNetworkNode;

        this.highlight(this.editedNode2, NETWORK_NODE_HIGHLIGHT_EDITED);

        this.editedNode2.position = F32A(_gfx.cursorWorldPosition);

        if ((x = this.pickNode(this.editedNode2.position)))
        {
            this.editedNode2.position = F32A(x.position);
        }

/*
        // check for valid angle for this new edge

        let angle: number;

        let ok, a;
        ok = true;
        angle = getAngle2D(this.editedNode1.position, this.editedNode2.position);

        this.edges.forEach(edge => {
            if (edge.node1 == this.editedNode1)
            {
                a = getAngle2D(edge.node1.position, edge.node2.position);
                if (Math.abs(a - angle + Math.PI) < Math.PI/2)
                {
                    ok = false;
                }
            }
            if (edge.node2 == this.editedNode1)
            {
                a = getAngle2D(edge.node2.position, edge.node1.position);
                if (Math.abs(a - angle) > Math.PI/2)
                {
                    ok = false;
                }
            }
        });

        if (ok)
        {
            this.editedNode2.highlight = NETWORK_NODE_HIGHLIGHT_EDITED;
        }
        else
        {
            this.editedNode2.highlight = NETWORK_NODE_HIGHLIGHT_INVALID;
        }
*/


        this.rebuildGfx();
    }

    editCancel()
    {
        this.showNodes = false;
        this.deleteNode(this.editedNode2);
    }

    editFinish()
    {
        let x: tNetworkNode;

        this.showNodes = false;


        if ((x = this.pickNode(this.editedNode2.position, false)))
        {
            this.deleteNode(this.editedNode2);
            this.editedNode2 = x;
            this.addEdge(this.editedNode1, x, false);
        }

        this.editedNode2.highlight = NETWORK_NODE_HIGHLIGHT_NONE;
        this.rebuildGfx();
    }

    highlight(node: tNetworkNode, value: number)
    {
        this.nodes.forEach(x => {
           if (x == node)
           {
               x.highlight = value;
           }
           else
           {
               x.highlight = NETWORK_NODE_HIGHLIGHT_NONE;
           }
        });

        this.rebuildGfx();
    }

    rebuildGfx()
    {
        this.nodes.forEach((a) => {
            a.webglGfxObject.x = a.position[0];
            a.webglGfxObject.y = a.position[1];
            a.webglGfxObject.z = a.position[2];
            a.webglGfxObject.visible = this.showNodes;
            a.webglGfxObject.highlighted = (a.highlight != NETWORK_NODE_HIGHLIGHT_NONE);
        });

        let vertices: Array<number>;
        let indices: Array<number>;
        let colors: Array<number>;
        let i: number;
        let c: number;

        vertices = [];
        indices = [];
        colors = [];
        i = 0;

        this.edges.forEach((edge) => {
            let angle:number;
            let p1: Float32Array;
            let p2: Float32Array;
            let p3: Float32Array;
            let p4: Float32Array;

            angle = getAngle2D(edge.node1.position, edge.node2.position);
            p1 = offset3D(edge.node1.position, angle, ROAD_WIDTH / 2, 0.2);
            p2 = offset3D(edge.node1.position, angle, - ROAD_WIDTH / 2, 0.2);
            p3 = offset3D(edge.node2.position, angle, ROAD_WIDTH / 2, 0.2);
            p4 = offset3D(edge.node2.position, angle, - ROAD_WIDTH / 2, 0.2);

/*
            vertices.push(
                ...p4, ...p3, ...p1,
                ...p2, ...p4, ...p1
            );

            // google closure compiler screws this up somehow
            // tries a concat on Float32Array
            //
            // becomes this:
            // c: vertices; l-n-t-h: p1-p4
            //  c.push.apply(c, h.concat(t, l, n, h, l));
            //
            // the push()es are +28 bytes of final zip
*/
            vertices.push(
                p4[0],p4[1],p4[2], p3[0],p3[1],p3[2], p1[0],p1[1],p1[2],
                p2[0],p2[1],p2[2], p4[0],p4[1],p4[2], p1[0],p1[1],p1[2],
            );

            indices.push(
                i++, i++, i++,
                i++, i++, i++
            );

            c = 1;
            if (edge.node1.highlight == NETWORK_NODE_HIGHLIGHT_INVALID || edge.node2.highlight == NETWORK_NODE_HIGHLIGHT_INVALID)
            {
                c = 8;
            }
            else if (edge.node1.highlight == NETWORK_NODE_HIGHLIGHT_EDITED || edge.node2.highlight == NETWORK_NODE_HIGHLIGHT_EDITED)
            {
                c = 3;
            }

            colors.push(
                c,c,c,
                c,c,c
            );
        });

        // shape SHAPE_DYNAMIC_ROAD_INDEX, object 3
        _gfx.destroyShape(SHAPE_DYNAMIC_ROAD_INDEX);
        _gfx.shapes[SHAPE_DYNAMIC_ROAD_INDEX] = _gfx.buildShape3(new Float32Array(vertices), new Uint16Array(indices), new Uint8Array(colors));
        this.webglGfxObject.shape = _gfx.shapes[SHAPE_DYNAMIC_ROAD_INDEX];

        // console.log(vertices);
    }

    // Get the shortest path using Dijkstra's algorithm.
    // Result does not contain the starting point.
    // Result is an empty array if target is not reachable.
    getPath(startNode: tNetworkNode, targetNode: tNetworkNode)
    {
        if (!startNode || !targetNode)
        {
            return [];
        }

        this.nodes.forEach((node) => {
            node.visited = false;
            node.totalDistance = DISTANCE_MAX;
            node.neighbours = [];
            node.previousNode = null;
        });

        this.edges.forEach((edge) => {
            edge.node1.neighbours.push({ node: edge.node2, distance: edge.length })
            edge.node2.neighbours.push({ node: edge.node1, distance: edge.length })
        });

        function find(current: tNetworkNode, target: tNetworkNode)
        {
            current.visited = true;
            current.neighbours.forEach((a) => {
                if (current.totalDistance + a.distance < a.node.totalDistance)
                {
                    a.node.previousNode = current;
                    a.node.totalDistance = current.totalDistance + a.distance;
                }
                
                if (!a.node.visited)
                {
                    find(a.node, target);
                }
            });
        }
        
        startNode.totalDistance = 0;
        
        find(startNode, targetNode);

        let path: Array<tNetworkNode>;
        let p: tNetworkNode;
        
        path = [];

        p = targetNode;
        
        while (p.previousNode)
        {
            path.push(p);
            p = p.previousNode;
        }

        return path.reverse();
    }
}
