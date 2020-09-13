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
    lastPositions: Array<tPoint3D>;
    holdTime: number;
    stayInDepot: boolean;
    value: number;

    constructor(station)
    {
        this.vehicleIndex = (_vehicleIndexSequence++);
        this.title = `Bus #${this.vehicleIndex}`;
        this.station = station;
        this.position = F32A(station.position);
        this.scheduleIndex = 0;
        this.webglGfxObject = _gfx.createObject(SHAPE_VEHICLE_BUS_INDEX);
        this.stopped = false;
        this.state = VEHICLE_STATE_DEPOT;
        this.goodOnboard = createGoodList();
        this.goodCapacity = createGoodList();
        this.lastPositions = [];
        this.holdTime = 0;
        this.stayInDepot = true;
        this.schedule = [];
        this.scheduleIndex = 0;
    }

    toggleStopped()
    {
        this.stopped = !this.stopped;
    }

    unload()
    {
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

                    if (i == GOOD_PASSENGER)
                    {
                        increaseStat(STAT_PASSENGER_DELIVERED, n);
                    }
                    else
                    {
                        increaseStat(STAT_GOOD_DELIVERED, n);
                    }
                }
            });
        }

        if (income > 0)
        {
            newIncome(income);
        }
    }

    load()
    {
        let i, n;

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

                    if (i == GOOD_PASSENGER)
                    {
                        increaseStat(STAT_PASSENGER_PICKED_UP, n);
                    }
                    else
                    {
                        increaseStat(STAT_GOOD_PICKED_UP, n);
                    }
                }
            });
        }
        console.log("load done");
    }

    advanceSchedule()
    {
        let n;
        let path: Array<tNetworkNode>;

        console.log("advancing schedule...");

        n = this.scheduleIndex;
        this.path = [];

        if (this.schedule.length == 0)
        {
            this.scheduleIndex = 0;
            this.path = [];
            // console.log("empty schedule");
            return;
        }

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

        console.log(`... next stop: ${this.schedule[n].station.title}`);

        this.nextNode = this.path.shift();

        // TODO: (where?) lock the networkNodes and networkEdges on this path to make sure
        // this does not get invalidated (by deleting). Maybe only lock the current segment?
    }

    goToDepot()
    {
        let a: Station;
        let path: Array<tNetworkNode>;

        // TODO: find the _nearest_ depot

        for (a of _stations)
        {
            if (a.isDepot)
            {
                path = _roads.getPath(
                    _roads.getNearestNode(this.station),
                    _roads.getNearestNode(a)
                );

                // if the station is reachable
                if (path.length != 0)
                {
                    this.path = path;
                    this.nextNode = this.path.shift();
                    this.stayInDepot = true;
                    this.state = VEHICLE_STATE_TRAVELLING;
                    console.log("Going to depot...");
                    return;
                }
            }
        }

        windowCreateGeneric("Cannot go to depot", "No reachable depots found.");
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
                this.state = VEHICLE_STATE_UNLOADING;

                // time needed to unload
                this.holdTime = 20;
            break;

            case VEHICLE_STATE_UNLOADING:
                console.log("state: unloading");

                if (this.station != null)
                {
                    this.unload();
                }

                this.state = VEHICLE_STATE_LOADING;

                // time needed to load
                this.holdTime = 20;
            break;

            case VEHICLE_STATE_LOADING:
                console.log("state: loading");

                if (this.station != null)
                {
                    this.load();
                }

                // time needed to start
                this.holdTime = 10;

                if (this.station.isDepot)
                {
                    this.state = VEHICLE_STATE_DEPOT;
                }
                else
                {
                    this.station = null;
                    this.advanceSchedule();
                    this.state = VEHICLE_STATE_TRAVELLING;
                }
            break;

            case VEHICLE_STATE_DEPOT:
                // console.log("state: servicing");

                if (this.stayInDepot)
                {
                    this.stopped = true;
                    this.stayInDepot = false;
                }

                if (!this.stopped)
                {
                    this.station = null;
                    this.advanceSchedule();
                    this.state = VEHICLE_STATE_TRAVELLING;
                }
            break;
        }

        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];
    }


    setHighlight(value: boolean)
    {
        this.webglGfxObject.highlighted = value;
    }

    destroy()
    {
        destroyWindow(WINDOW_TYPE_VEHICLE, this.vehicleIndex, 0);
        this.webglGfxObject.visible = false;
    }
}

// TODO: have "index" instead of "*Index", have one function to search

function getStationByIndex(index: number): Station
{
    let a: Station;

    for (a of _stations)
    {
        if (a.stationIndex == index)
        {
            return a
        }
    }

    return null;
}

function getVehicleByIndex(vehicleIndex: number): Vehicle
{
    let a;

    for (a of _vehicles)
    {
        if (a.vehicleIndex == vehicleIndex)
        {
            return a
        }
    }

    return null;
}

let _vehicleEdited: Vehicle;

function scheduleDelete(vehicleIndex: number, scheduleIndex: number)
{
    let v;

    v = getVehicleByIndex(vehicleIndex);

    v.schedule.splice(scheduleIndex, 1);

    if (v.scheduleIndex == scheduleIndex)
    {
        // TODO: this resets the schedule pointer, it is a bit complicated to handle it nicely
        v.scheduleIndex = 0;
        v.advanceSchedule();
    }
    else if (v.scheduleIndex > scheduleIndex)
    {
        v.scheduleIndex--;
    }
}

function scheduleAppend(vehicleIndex: number)
{
    _vehicleEdited = getVehicleByIndex(vehicleIndex);
    setToolScheduleAppend();
}

function scheduleSkip(vehicleIndex: number)
{
    getVehicleByIndex(vehicleIndex).advanceSchedule();
}

function vehiclePause(vehicleIndex: number)
{
    getVehicleByIndex(vehicleIndex).toggleStopped();
}

function vehicleDepot(vehicleIndex: number)
{
    getVehicleByIndex(vehicleIndex).goToDepot();
}

function vehicleSell(vehicleIndex: number)
{
    let v: Vehicle;

    v = getVehicleByIndex(vehicleIndex);

    if (v.station && v.station.isDepot)
    {
        newIncome(v.value);
        v.destroy();
        removeFromArray(_vehicles, v);
    }
}
