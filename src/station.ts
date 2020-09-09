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
        this.goodAvailable = [];
        this.goodProduction = [];
        this.goodCapacity = [];
        this.goodAccepted = [];
        this.range = 10;
    }

    produceGoods()
    {
        let i, n: number;

        for (i in this.goodProduction)
        {
            if ((this.goodAvailable[i] || 0) < this.goodCapacity[i])
            {
                n = Math.min((this.goodAvailable[i] || 0) + this.goodProduction[i], this.goodCapacity[i]);
                this.goodAvailable[i] = (this.goodAvailable[i] || 0) + n;
                console.log(`produced good #1, count: ${n}, now available: ${this.goodAvailable[i]}`);
            }
        }
    }
}
