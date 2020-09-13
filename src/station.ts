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

        if (isDepot)
        {
            this.range = 0;
            this.title = `Depot ${this.stationIndex}`;
            this.webglGfxObject = _gfx.createObject(SHAPE_ROAD_DEPOT_INDEX);
        }
        else
        {
            this.range = 5;
            this.title = `Station ${this.stationIndex}`;
            this.webglGfxObject = _gfx.createObject(SHAPE_ROAD_BUS_STOP_INDEX);
        }

        p1 = _roads.addNode(this.position, true);
        p2 = _roads.addNode(this.position, true, this);
        p3 = _roads.addNode(this.position, true);

        _roads.addEdge(p1, p2, true);
        _roads.addEdge(p2, p3, true);

        this.roadParts.push(p1, p2, p3);

        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];

        this.setAngle(0);
        this.update();
    }

    setAngle(angle: number)
    {
        this.webglGfxObject.rz = angle;

        this.roadParts[0].position = F32A(offset3D(this.position, angle, (this.isDepot ? 2 : 8), 0))
        this.roadParts[2].position = F32A(offset3D(this.position, angle, (this.isDepot ? -10 : -8), 0))

        _roads.rebuildGfx();
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
