class Factory
{
    position: tPoint3D;
    goodAvailable: tGoodList;
    goodProduction: tGoodList;
    goodCapacity: tGoodList;
    goodAccepted: tGoodList;
    webglGfxObject: any;

    constructor(position: tPoint3D)
    {
        this.position = position;
        this.goodAvailable = createGoodList();
        this.goodProduction = createGoodList();
        this.goodCapacity = createGoodList();
        this.goodAccepted = createGoodList();

        this.webglGfxObject = _gfx.createObject(SHAPE_RANGE_INDEX);

        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];
    }

    produce()
    {
        let i, n: number;

        for (i in this.goodProduction)
        {
            if (this.goodAvailable[i] < this.goodCapacity[i])
            {
                if (this.goodAvailable[i] + this.goodProduction[i] <= this.goodCapacity[i])
                {
                    n = this.goodProduction[i];
                }
                else
                {
                    n = this.goodCapacity[i] - this.goodAvailable[i];
                }
                this.goodAvailable[i] = this.goodAvailable[i] + n;
                console.log(`produced good #${i}, count: ${n}, now available: ${this.goodAvailable[i]}`);
            }
        }
    }
}