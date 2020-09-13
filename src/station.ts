let _stationIndexSequence = 0;

class Station
{
    position: tPoint3D;
    stationIndex: number;
    range: number;
    factoriesInRange: Array<Factory>;
    webglGfxObject: any;
    title: string;
    isDepot: boolean;
    roadParts: Array<tNetworkNode>;

    constructor(position: tPoint3D, isDepot: boolean)
    {
        this.stationIndex = (_stationIndexSequence++);
        this.position = position;
        this.isDepot = isDepot;
        this.roadParts = [];

        let p1, p2, p3;

        p2 = _roads.addNode([ this.position[0], this.position[1], this.position[2] ], true, this);

        if (isDepot)
        {
            this.range = 0;
            this.title = `Depot ${this.stationIndex}`;
            this.webglGfxObject = _gfx.createObject(SHAPE_ROAD_DEPOT_INDEX);

            p1 = _roads.addNode([ this.position[0], this.position[1] + 2, this.position[2] ], true);
            p3 = _roads.addNode([ this.position[0], this.position[1] - 10, this.position[2] ], true);

        }
        else
        {
            this.range = 5;
            this.title = `Station ${this.stationIndex}`;
            this.webglGfxObject = _gfx.createObject(SHAPE_ROAD_BUS_STOP_INDEX);

            p1 = _roads.addNode([ this.position[0], this.position[1] + 8, this.position[2] ], true);
            p3 = _roads.addNode([ this.position[0], this.position[1] - 8, this.position[2] ], true);
        }


        _roads.addEdge(p1, p2);
        _roads.addEdge(p2, p3);

        this.roadParts.push(p1, p2, p3);

        _roads.rebuildGfx();

        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];

        this.update();
    }

    update()
    {
        this.factoriesInRange = [];

        _factories.forEach(factory => {
            if (distance3D(factory.position, this.position) <= this.range)
            {
                this.factoriesInRange.push(factory);
            }
        });
    }

    destroy()
    {
        this.webglGfxObject.visible = false;
        this.roadParts.forEach(x => _roads.deleteNode(x));
    }

    setHighlight(value: boolean)
    {
        this.webglGfxObject.highlighted = value;
    }
}
