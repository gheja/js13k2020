type tNetworkNeighbour = {
    node: any, // it is "tNetworkNode" actually but tscc overflows
    distance: number
};

type tNetworkNode = {
    position: tPoint3D,
    locked: boolean,
    station: Station,
    highlighted: boolean,
    webglGfxObject: any,
    angle: number,

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
    highlighted: boolean,
    length: number,
};

class Network
{
    nodes: Array<tNetworkNode>;
    edges: Array<tNetworkEdge>;
    webglGfxObject: any;

    constructor()
    {
        this.nodes = [];
        this.edges = [];
        this.webglGfxObject = _gfx.createObject(SHAPE_DYNAMIC_ROAD_INDEX);
    }

    addNode(position: tPoint3D, locked: boolean, station: Station=null)
    {
        let a: tNetworkNode;

        a = {
            position: position,
            locked: locked,
            station: station,
            webglGfxObject: _gfx.createObject(SHAPE_ROAD_NODE_INDEX),
            highlighted: false,
            angle: null,
            visited: false,
            totalDistance: null,
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
            highlighted: false,
            length: distance3D(node1.position, node2.position),
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
