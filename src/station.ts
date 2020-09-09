class Station
{
    position: tPoint3D;
    goodAvailable: tGoodList;
    goodProduction: tGoodList;
    goodCapacity: tGoodList;
    goodAccepted: tGoodList;
    range: number;

    constructor(position)
    {
        this.position = position;
        this.goodAvailable = createGoodList();
        this.goodProduction = createGoodList();
        this.goodCapacity = createGoodList();
        this.goodAccepted = createGoodList();
        this.range = 10;
    }

    produceGoods()
    {
        let i, n: number;

        for (i in this.goodProduction)
        {
            if (this.goodAvailable[i] < this.goodCapacity[i])
            {
                n = Math.min(this.goodAvailable[i] + this.goodProduction[i], this.goodCapacity[i]);
                this.goodAvailable[i] = this.goodAvailable[i] + n;
                console.log(`produced good #1, count: ${n}, now available: ${this.goodAvailable[i]}`);
            }
        }
    }
}
