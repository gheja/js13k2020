const ROAD_WIDTH = 2;
const DISTANCE_MAX = 100000;
const VEHICLE_STEP_SIZE = 0.01;

// const VEHICLE_STATE_STOPPED = 0;
const VEHICLE_STATE_LEAVING = 1;
const VEHICLE_STATE_TRAVELLING = 2;
const VEHICLE_STATE_ARRIVING = 3;
const VEHICLE_STATE_ARRIVED = 4;

const GOOD_PASSENGER = 1;
const GOOD_MAIL = 2;
const GOOD_WOOD = 3;
const GOOD_COAL = 4;

const GOOD_ICONS = [ "", "🧑", "✉️" ];

const WINDOW_TYPE_VEHICLE = 1;
const WINDOW_TYPE_STATION = 2;
const WINDOW_TYPE_STATS = 3;
const WINDOW_TYPE_BANK = 4;

const STAT_CREDITS = 0;
const STAT_SPENT_BUILDING = 1;
const STAT_SPENT_UPKEEP = 2;
const STAT_SPENT_OTHER = 3;
const STAT_TICKS = 4;
const STAT_PASSENGER_PICKED_UP = 5;
const STAT_PASSENGER_DELIVERED = 6;
const STAT_GOOD_PICKED_UP = 7;
const STAT_GOOD_DELIVERED = 8;
const STAT_LOAN_TAKEN = 9
const STAT_LOAN_REPAID = 10;
const STAT_LOAN_INTEREST_PAID = 11;

const STAT_TEXTS = [
    "Credits earned",
    "Credits spent on construction",
    "Credits spent on upkeep",
    "Credits spent other",
    "",
    "Passengers picked up",
    "Passengers delivered",
    "Goods picked up",
    "Goods delivered",
    "Loan x",
    "Loan repaid",
    "Loan interest paid",
];
