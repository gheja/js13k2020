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
    angle: number,
    highlight: number,

    // aligned diagonally at "angle"
    edge1: tPoint3D,
    edge2: tPoint3D,

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
            angle: null,
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

    pickNode(position: tPoint3D)
    {
        let a;

        for (a of this.nodes)
        {
            if (a !== this.editedNode2 && distance3D(a.position, position) < 2)
            {
                return a;
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
        this.editedNode2.highlight = NETWORK_NODE_HIGHLIGHT_EDITED;
        this.addEdge(this.editedNode1, this.editedNode2, false);
    }

    editUpdate()
    {
        let x: tNetworkNode;

        this.editedNode2.position = F32A(_gfx.cursorWorldPosition);

        if ((x = this.pickNode(this.editedNode2.position)))
        {
            this.editedNode2.position = F32A(x.position);
        }

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

        if ((x = this.pickNode(this.editedNode2.position)))
        {
            this.deleteNode(this.editedNode2);
            this.editedNode2 = x;
            this.addEdge(this.editedNode1, x, false);
        }

        this.editedNode2.highlight = NETWORK_NODE_HIGHLIGHT_NONE;
        this.rebuildGfx();
    }

    rebuildGfx()
    {
        this.nodes.forEach((a) => {
            a.angle = null;
            a.webglGfxObject.x = a.position[0];
            a.webglGfxObject.y = a.position[1];
            a.webglGfxObject.z = a.position[2];
            a.webglGfxObject.visible = this.showNodes;
        });

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
        let c: number;

        vertices = [];
        indices = [];
        colors = [];
        i = 0;

        this.edges.forEach((edge) => {
            vertices.push(...edge.node2.edge2, ...edge.node1.edge2, ...edge.node1.edge1, ...edge.node2.edge2, ...edge.node1.edge1, ...edge.node2.edge1);
            indices.push(i++, i++, i++, i++, i++, i++);
            c = 1;
            if (edge.node1.highlight == NETWORK_NODE_HIGHLIGHT_INVALID || edge.node2.highlight == NETWORK_NODE_HIGHLIGHT_INVALID)
            {
                c = 8;
            }
            else if (edge.node1.highlight == NETWORK_NODE_HIGHLIGHT_EDITED || edge.node2.highlight == NETWORK_NODE_HIGHLIGHT_EDITED)
            {
                c = 3;
            }

            colors.push(c,c,c,c,c,c);
        });

        // shape SHAPE_DYNAMIC_ROAD_INDEX, object 3
        _gfx.destroyShape(SHAPE_DYNAMIC_ROAD_INDEX);
        _gfx.shapes[SHAPE_DYNAMIC_ROAD_INDEX] = _gfx.buildShape3(new Float32Array(vertices), new Uint16Array(indices), new Uint8Array(colors));
        this.webglGfxObject.shape = _gfx.shapes[SHAPE_DYNAMIC_ROAD_INDEX];

        console.log(vertices);
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
