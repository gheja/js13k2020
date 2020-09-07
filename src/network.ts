type tNetworkNode = {
    position: tPoint3D,
    locked: boolean,
    stop: boolean,
    highlighted: boolean,
    webglGfxObject: any,
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

    addNode(position: tPoint3D, locked: boolean, stop: boolean)
    {
        let a: tNetworkNode;

        a = {
            position: position,
            locked: locked,
            stop: stop,
            webglGfxObject: _gfx.createObject(_gfx.shapes[SHAPE_ROAD_NODE_INDEX]),
            highlighted: false,
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
        let node: tNetworkNode;

        if (highlight)
        {
            for (node of this.nodes)
            {
                node.highlighted = false;
            }
        }

        for (node of this.nodes)
        {
            if (distance3D(node.position, position) < 0.5)
            {
                node.highlighted = true;
                console.log(node);
                return node;
            }
        }

        return null;
    }
}