type tScheduleItem = {
  station: Station,
};
// an "operation" might be a good idea?
// i.e. auto (load any and unload any - default), load (any, and *don't* unload), unload (same), load all, unload all, etc.

type tSchedule = Array<tScheduleItem>;

let _vehicleIndexSequence = 0;

class Vehicle
{
    vehicleIndex: number;
    title: string;
    position: tPoint3D;
    station: Station;
    schedule: tSchedule;
    scheduleIndex: number;
    path: Array<tNetworkNode>;
    speed: number;
    webglGfxObject: any;
    nextNode: tNetworkNode;
    stopped: boolean; // == ordered to halt by the player
    state: number; // VEHICLE_STATE_*
    goodOnboard: tGoodList;
    goodCapacity: tGoodList;
    loadingDone: boolean;
    lastPositions: Array<tPoint3D>;
    holdTime: number;

    constructor(station)
    {
        this.vehicleIndex = (_vehicleIndexSequence++);
        this.title = `Bus #${this.vehicleIndex}`;
        this.station = station;
        this.position = F32A(station.position);
        this.scheduleIndex = 0;
        this.webglGfxObject = _gfx.createObject(SHAPE_VEHICLE_BUS_INDEX);
        this.stopped = false;
        this.state = VEHICLE_STATE_ARRIVED;
        this.goodOnboard = createGoodList();
        this.goodCapacity = createGoodList();
        this.lastPositions = [];
        this.holdTime = 0;
    }

    toggleStopped()
    {
        this.stopped = !this.stopped;
    }

    loadUnload()
    {
        // TODO: add a proper delay

        let i, n, income;

        income = 0;

        for (i in this.goodOnboard)
        {
            this.station.factoriesInRange.forEach((factory) =>
            {
                if (factory.goodAccepted[i] && this.goodOnboard[i] > 0)
                {
                    // unload the goods to this station, "sell" it
                    n = this.goodOnboard[i];
                    income += 5 * n;

                    this.goodOnboard[i] = 0;

                    console.log(`unloading good #${i}, count: ${n}`);
                    createBubble(`🔻 ${GOOD_ICONS[i]}x${n}`);
                }
            });
        }

        for (i in this.goodCapacity)
        {
            this.station.factoriesInRange.forEach((factory) =>
            {
                if (factory.goodAvailable[i] > 0 && this.goodCapacity[i] > 0)
                {
                    // load all the goods we can from station
                    n = Math.min(this.goodCapacity[i], this.goodOnboard[i] + factory.goodAvailable[i]) - this.goodOnboard[i];
                    this.goodOnboard[i] = this.goodOnboard[i] + n;
                    factory.goodAvailable[i] -= n;

                    console.log(`loading good #${i}, count: ${n}, on board: ${this.goodOnboard[i]}`);
                    createBubble(`🔺 ${GOOD_ICONS[i]}x${n}`);
                }
            });
        }

        if (income > 0)
        {
            createBubble(`💵 \$${income}`);
        }

        console.log("load-unload done");
        this.loadingDone = true;
    }

    advanceSchedule()
    {
        let n;
        let path: Array<tNetworkNode>;

        n = this.scheduleIndex;
        this.path = [];

        while (1)
        {
            n = (n + 1) % this.schedule.length;

            // if all entries are unreachable it loops back to start
            if (n == this.scheduleIndex)
            {
                console.log("invalid schedule");
                return;
            }

            path = _roads.getPath(
                _roads.getNearestNode(this.schedule[this.scheduleIndex].station),
                _roads.getNearestNode(this.schedule[n].station)
            );

            // if the station is reachable
            if (path.length != 0)
            {
                this.scheduleIndex = n;
                this.path = path;
                break;
            }
        }

        this.nextNode = this.path.shift();

        // TODO: (where?) lock the networkNodes and networkEdges on this path to make sure
        // this does not get invalidated (by deleting). Maybe only lock the current segment?
    }

    move()
    {
        let steps: number;
        let p: tPoint3D;

/*
        // not needed as move() is not called when nextNode == null
        if (!this.nextNode)
        {
            this.speed = 0;
            return;
        }
*/

        this.speed = 0.5;
        steps = Math.floor(this.speed / VEHICLE_STEP_SIZE); // distance to travel

        while (steps > 0)
        {
            p = this.nextNode.position;

            this.position = goTowards3D(this.position, p, VEHICLE_STEP_SIZE);

            if (distance3D(this.position, p) < 0.1)
            {
                // arrived at node
                this.position = F32A(p);

                // arrived at destination
                if (this.path.length == 0)
                {
                    // arrived here
                    this.station = this.nextNode.station;

                    this.nextNode = null;
                    this.speed = 0; // needed?
                    this.state = VEHICLE_STATE_ARRIVING;
                    break;
                }

                this.nextNode = this.path.shift();
            }

            steps--;
        }


        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];

        this.lastPositions.unshift(F32A(this.position));

        if (this.lastPositions.length == 1000)
        {
            this.lastPositions.pop();
        }

        if (this.lastPositions.length > 5)
        {
            this.webglGfxObject.rz = getAngle2D(this.lastPositions[5], this.lastPositions[0]) + Math.PI/2;
        }
    }

    step()
    {
        if (this.holdTime > 0)
        {
            this.holdTime--;
            return;
        }

        switch (this.state)
        {
            case VEHICLE_STATE_TRAVELLING:
                if (!this.stopped)
                {
                    if (this.nextNode)
                    {
                        this.move();
                    }
                    else
                    {
                        this.advanceSchedule();
                    }
                }
            break;

            case VEHICLE_STATE_ARRIVING:
                console.log("state: arriving");
                this.loadingDone = false;
                this.state = VEHICLE_STATE_ARRIVED;
                // time needed to load-unload
                this.holdTime = 20;
            break;

            case VEHICLE_STATE_ARRIVED:
                console.log("state: arrived");
                this.loadUnload();
                if (this.loadingDone)
                {
                    this.state = VEHICLE_STATE_LEAVING;
                    this.advanceSchedule();
                }
                // time needed to start
                this.holdTime = 10;
            break;

            case VEHICLE_STATE_LEAVING:
                console.log("state: leaving");
                this.station = null;
                this.state = VEHICLE_STATE_TRAVELLING;
            break;
        }
    }
}
