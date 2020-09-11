let _stationIndexSequence = 0;

class Station
{
    position: tPoint3D;
    stationIndex: number;
    range: number;
    factoriesInRange: Array<Factory>;
    webglGfxObject: any;
    title: string;

    constructor(position)
    {
        this.stationIndex = (_stationIndexSequence++);
        this.position = position;
        this.range = 5;

        this.title = `Station ${this.stationIndex}`;

        this.webglGfxObject = _gfx.createObject(SHAPE_STATION_INDEX),

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
}
