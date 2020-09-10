type tScheduleItem = {
  station: Station,
};
// an "operation" might be a good idea?
// i.e. auto (load any and unload any - default), load (any, and *don't* unload), unload (same), load all, unload all, etc.

type tSchedule = Array<tScheduleItem>;

class Vehicle
{
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

    constructor(station)
    {
        this.station = station;
        this.position = F32A(station.position);
        this.scheduleIndex = 0;
        this.webglGfxObject = _gfx.createObject(SHAPE_VEHICLE_BUS_INDEX);
        this.stopped = false;
        this.state = VEHICLE_STATE_ARRIVED;
        this.goodOnboard = createGoodList();
        this.goodCapacity = createGoodList();
        this.lastPositions = [];
    }

    toggleStopped()
    {
        this.stopped = !this.stopped;
    }

    loadUnload()
    {
        // TODO: add a proper delay

        let i, n;

        for (i in this.goodOnboard)
        {
            if (this.station.goodAccepted[i] && this.goodOnboard[i] > 0)
            {
                // unload the goods to this station, "sell" it
                n = this.goodOnboard[i];
                console.log(`unloading good #${i}, count: ${n}`);
                this.goodOnboard[i] = 0;
            }
        }

        for (i in this.goodCapacity)
        {
            if (this.station.goodAvailable[i] > 0 && this.goodCapacity[i] > 0)
            {
                // load all the goods we can from station
                n = Math.min(this.goodCapacity[i], this.goodOnboard[i] + this.station.goodAvailable[i]) - this.goodOnboard[i];
                this.goodOnboard[i] = this.goodOnboard[i] + n;
                this.station.goodAvailable[i] -= n;

                console.log(`loading good #${i}, count: ${n}, on board: ${this.goodOnboard[i]}`);
            }
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
            break;

            case VEHICLE_STATE_ARRIVED:
                console.log("state: arrived");
                this.loadUnload();
                if (this.loadingDone)
                {
                    this.state = VEHICLE_STATE_LEAVING;
                    this.advanceSchedule();
                }
            break;

            case VEHICLE_STATE_LEAVING:
                console.log("state: leaving");
                this.station = null;
                this.state = VEHICLE_STATE_TRAVELLING;
            break;
        }
    }
}
