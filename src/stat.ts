let _stats = [];

function initStats()
{
    _stats = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}

function increaseStat(key: number, value: number)
{
    _stats[key] += value;
}

function getStat(key: number)
{
    return _stats[key];
}