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
    stopped: boolean;

    constructor(station)
    {
        this.station = station;
        this.position = F32A(station.position);
        this.scheduleIndex = 0;
        this.webglGfxObject = _gfx.createObject(_gfx.shapes[SHAPE_ROAD_NODE_INDEX]);
        this.stopped = false;
    }

    toggleStopped()
    {
        this.stopped = !this.stopped;
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

            if (n == this.scheduleIndex)
            {
                console.log("invalid schedule");
                return;
            }

            path = _roads.getPath(
                _roads.getNearestNode(this.schedule[this.scheduleIndex].station),
                _roads.getNearestNode(this.schedule[n].station)
            );

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

        if (!this.nextNode)
        {
            this.speed = 0;
            return;
        }

        this.speed = 0.5;
        steps = Math.floor(this.speed / VEHICLE_STEP_SIZE); // distance to travel

        while (steps > 0)
        {
            p = this.nextNode.position;

            this.position = goTowards3D(this.position, p, VEHICLE_STEP_SIZE);

            if (distance3D(this.position, p) < 0.1)
            {
                // arrived at node
                // todo: copy this data?
                this.position = F32A(p);

                // arrived at destination
                if (this.path.length == 0)
                {
                    this.nextNode = null;
                    this.speed = 0; // needed?
                    break;
                }

                this.nextNode = this.path.shift();
            }

            steps--;
        }

        this.webglGfxObject.x = this.position[0];
        this.webglGfxObject.y = this.position[1];
        this.webglGfxObject.z = this.position[2];
    }

    step()
    {
        if (!this.stopped)
        {
            if (!this.nextNode)
            {
                this.advanceSchedule();
            }

            if (this.nextNode)
            {
                this.move();
            }
        }

    }
}