const COLOR_PALETTE: tColorPalette = [
    [ 0.28, 0.46, 0.46 ],
    [ 0.56, 0.10, 0.11 ],
    [ 0.56, 0.10, 0.15 ],
    [ 0.4, 1, 0.5 ],
    [ 0.5, 1, 0.7 ],
    [ 0.6, 1, 0.5 ],
    [ 0.7, 1, 0.5 ],
    [ 0.8, 1, 0.5 ],
    [ 0, 0.77, 0.45 ],
    [ 0, 0, 0.2 ],
    [ 0, 0, 0.3 ],
    [ 0.12, 1, 0.5 ],
    [ 0.05, 0.21, 0.71 ],
    [ 0.0, 0, 0.8 ],
];

const COLOR_HIGHLIGHT_INDEX = 13;

const SHAPE_TEST1: tShapeDefinition = [
    SHAPE_SET_SIDES, 4,
    SHAPE_SET_COLOR, 0,
    SHAPE_SET_SCALE, 0.2,
    SHAPE_SLICE_SET_HEIGHT, 0.3,
    SHAPE_SET_AUTOCLOSE, 1,
    SHAPE_SLICE_POINTS, -1, -1, 1, -1, 1, 1, -1, 1,
    SHAPE_SET_SCALE, 0.3,
    SHAPE_SET_COLOR, 1,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0.5,
    SHAPE_SET_COLOR, 2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 1,
    SHAPE_SET_COLOR, 3,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR, 4,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SLICE_REPEAT,
];

const SHAPE_TEST2: tShapeDefinition = [
    SHAPE_SET_SIDES, 3,
    SHAPE_SET_COLOR, 0,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SLICE_SET_HEIGHT, 2,
    SHAPE_SET_AUTOCLOSE, 1,
    SHAPE_SLICE_POINTS, 5, 3.5, -5, 3.5, 0, -5.5,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, 1,
    SHAPE_SET_SCALE, 0.2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0.3,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0.2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SLICE_REPEAT,
];

const SHAPE_PLANE: tShapeDefinition = [
    SHAPE_SET_SIDES, 4,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SET_SCALE, 50,
    SHAPE_SET_COLOR, 0,
    SHAPE_SLICE_POINTS, -1, -1, 1, -1, 1, 1, -1, 1,
    SHAPE_SLICE_POINTS, 0, 0, 0, 0, 0, 0, 0, 0,
];

const SHAPE_PLANE_SMALL: tShapeDefinition = [
    SHAPE_SET_SIDES, 4,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SET_SCALE, 0.5,
    SHAPE_SET_COLOR_LOCAL, 0,
    SHAPE_SLICE_POINTS, -1, -1, 1, -1, 1, 1, -1, 1,
    SHAPE_SLICE_POINTS, 0, 0, 0, 0, 0, 0, 0, 0,
];

const SHAPE_TRAIN1: tShapeDefinition = [
    SHAPE_SET_SIDES, 7,
    SHAPE_SLICE_SET_HEIGHT, 1,
    SHAPE_SET_SCALE, 0.5,
    SHAPE_SET_MIRROR_X, 1,
    SHAPE_SET_COLOR, 2,
    SHAPE_SLICE_POINTS, -5, 27, -5, 20, -3, 20, -3, 8, -5, 8, -5, 5, 0, 0,
    SHAPE_SLICE_POINTS, -5, 27, -5, 20, 0, 20, 0, 8, 0, 7, 0, 6, 0, 5,
];

const SHAPE_CURSOR: tShapeDefinition = [
    SHAPE_SET_SCALE, 1,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SET_COLOR_LOCAL, 0,
    SHAPE_SLICE_CIRCLE, 13, 2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0.8,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, -0.5,
    SHAPE_SLICE_REPEAT,
];

const SHAPE_RANGE: tShapeDefinition = [
    SHAPE_SET_SCALE, 12.5,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SET_COLOR_LOCAL, 0,
    SHAPE_SLICE_CIRCLE, 33, 2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 12.3,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, -0.5,
    SHAPE_SLICE_REPEAT,
];

const SHAPE_ROAD_NODE: tShapeDefinition = [
    SHAPE_SET_SCALE, 1,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SET_COLOR_LOCAL, 0,
    SHAPE_SLICE_CIRCLE, 13, 0.5,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_SCALE, 0.8,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, -0.5,
    SHAPE_SLICE_REPEAT,
];

const SHAPE_BUS: tShapeDefinition = [
    SHAPE_GOTO,0,6,0.3,0,0,0,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SET_MIRROR_X, 1,
    SHAPE_SET_COLOR_LOCAL, 0,
    SHAPE_SET_SIDES, 24,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SLICE_POINTS, 0,-120,13,-120,13,-116,8,-116,8,-102,13,-102,13,-99,10,-99,10,-89,13,-89,13,-71,8,-71,8,-58,13,-58,13,-38,10,-38,10,-29,13,-29,13,-26,8,-26,8,-12,13,-12,13,-4,11,-2,0,-2,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SLICE_POINTS, 0,-120,13,-120,13,-116,8,-116,8,-102,13,-102,13,-99,10,-99,10,-89,13,-89,13,-71,8,-71,8,-58,13,-58,13,-38,10,-38,10,-29,13,-29,13,-26,8,-26,8,-12,13,-12,13,-2,11,0,0,0,
    SHAPE_SET_COLOR_LOCAL, 1,
    SHAPE_SLICE_SET_HEIGHT, 0.2,
    SHAPE_SLICE_POINTS, 0,-120,13,-119,13,-116,8,-116,8,-102,13,-102,13,-96,10,-96,10,-92,13,-92,13,-71,8,-71,8,-58,13,-58,13,-35,10,-35,10,-32,13,-32,13,-26,8,-26,8,-12,13,-12,13,-2,11,0,0,0,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SLICE_POINTS, 0,-120,13,-119,13,-116,8,-116,8,-102,13,-102,13,-96,13,-95,13,-93,13,-92,13,-71,8,-71,8,-58,13,-58,13,-35,13,-34,13,-33,13,-32,13,-26,8,-26,8,-12,13,-12,13,-2,11,0,0,0,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SET_COLOR_LOCAL, 2,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR_LOCAL, 3,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SLICE_POINTS, 0,-117,13,-117,13,-116,8,-116,8,-102,13,-102,13,-101,8,-101,8,-72,13,-72,13,-71,8,-71,8,-58,13,-58,13,-57,8,-57,8,-27,13,-27,13,-26,8,-26,8,-12,13,-12,13,-2,11,0,0,0,
    SHAPE_SLICE_SET_HEIGHT, 0.5,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR_LOCAL, 4,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR_LOCAL, 5,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR_LOCAL, 6,
    SHAPE_SLICE_REPEAT,
    SHAPE_SET_COLOR_LOCAL, 7,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SET_COLOR_LOCAL, 8,
    SHAPE_SLICE_POINTS, 0,-117,13,-117,13,-116,13,-115,13,-103,13,-102,13,-101,13,-100,13,-73,13,-72,13,-71,13,-70,13,-59,13,-58,13,-57,13,-56,13,-28,13,-27,13,-26,13,-25,13,-13,13,-12,13,-2,11,0,0,0,
    SHAPE_SLICE_SET_HEIGHT, 0.25,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_POINTS, 0,-115,11,-115,12,-114,12,-112,12,-103,12,-102,12,-101,12,-100,12,-73,12,-72,12,-71,12,-70,12,-59,12,-58,12,-57,12,-56,12,-28,12,-27,12,-26,12,-25,12,-13,12,-12,12,-4,10,-2,0,-2,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SET_SCALE, 0.0,
    SHAPE_SLICE_REPEAT,

    SHAPE_GOTO,0,6,0.3,0,0,0,
    SHAPE_SET_COLOR_LOCAL, 9,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SET_SIDES, 12,
    SHAPE_SLICE_SET_HEIGHT, 0.9,
    SHAPE_SET_SIDES, 10,
    SHAPE_SLICE_POINTS, 12.5,-117,12.5,-101,8,-101,8,-72,12.5,-72,12.5,-57,8,-57,8,-27,12.5,-27,12.5,-10,
    SHAPE_SLICE_REPEAT,

    SHAPE_GOTO,0,6,1.2,0,0,0,
    SHAPE_SET_SIDES, 4,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SLICE_SET_HEIGHT, 2.3,
    SHAPE_SLICE_POINTS, 0,-119,5,-119,12.5,-118,12.5,-10,
    SHAPE_SLICE_POINTS, 0,-117,9,-117,12.5,-117,12.5,-10,
];

const SHAPE_DUMMY: tShapeDefinition = [];

const SHAPE_ROAD_DEPOT: tShapeDefinition = [
    SHAPE_GOTO,0,-6,0,0,0,0,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SET_MIRROR_X, 1,
    SHAPE_SET_SIDES, 6,
    SHAPE_SET_COLOR, 12,
    SHAPE_SLICE_SET_HEIGHT, 4.5,
    SHAPE_SLICE_POINTS, 0,0,23,0,23,-15,33,-15,33,124,0,124,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SLICE_POINTS, 0,-16,2,-16,4,-16,34,-16,34,125,0,125,
    SHAPE_SLICE_SET_HEIGHT, 1.8,
    SHAPE_SET_COLOR,8,
    SHAPE_SLICE_POINTS, 0,-5,2,-5,4,-5,7,-5,7,113,0,113,
    SHAPE_SLICE_SET_HEIGHT, 0.0,
    SHAPE_SET_SCALE,0,
    SHAPE_SLICE_REPEAT,

    SHAPE_GOTO,0,-6,0,0,0,0,
    SHAPE_SET_SCALE,0.1,
    SHAPE_SET_COLOR, 1,
    SHAPE_SET_SIDES, 2,
    SHAPE_SLICE_SET_HEIGHT, 4.5,
    SHAPE_SLICE_POINTS, 0,-2,24,-2,
    SHAPE_SLICE_POINTS, 0,-14,24,-14,

    SHAPE_SET_SIDES, 2,
];

const SHAPE_ROAD_BUS_STOP: tShapeDefinition = [
    SHAPE_GOTO,0,-6,0,0,0,0,
    SHAPE_SET_COLOR, 12,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SET_SIDES, 6,
    SHAPE_SLICE_POINTS, 15,-10,20,-10,25,-10,25,120,20,120,15,115,
    SHAPE_SLICE_SET_HEIGHT, 0.3,
    SHAPE_SLICE_REPEAT,
    SHAPE_SLICE_SET_HEIGHT, 0,
    SHAPE_SLICE_POINTS, 20,30,20,30,20,30,20,40,20,40,20,40,

    SHAPE_GOTO,1.75,-6+11,0,0,0,0,
    SHAPE_SET_COLOR, 13,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SLICE_SET_HEIGHT, 3.7,
    SHAPE_SLICE_CIRCLE,14,1,
    SHAPE_SLICE_REPEAT,

    SHAPE_GOTO,1.75,-6+10.8,2.5,0,0,0,
    SHAPE_SET_COLOR, 5,
    SHAPE_SET_SCALE, 0.1,
    SHAPE_SET_SIDES, 4,
    SHAPE_SLICE_SET_HEIGHT, 1,
    SHAPE_SLICE_POINTS, -5,0,5,0,5,0.1,-5,0.1,
    SHAPE_SLICE_REPEAT,

]

const WEBGL_SHAPES_TO_LOAD: Array<tShapeDefinitionV2> = [
    [ SHAPE_PLANE ],
    [ SHAPE_TRAIN1 ],
    [ SHAPE_CURSOR, [ 3 ] ],
    [ SHAPE_ROAD_NODE, [ 5 ] ],
    [ SHAPE_BUS, [ 1, 5, 5, 5, 5, 5, 5, 5, 1, 4 ] ],
    [ SHAPE_DUMMY ],
    [ SHAPE_CURSOR, [ 8 ] ],
    [ SHAPE_CURSOR, [ 7 ] ],
    [ SHAPE_PLANE_SMALL, [ 9 ] ],
    [ SHAPE_PLANE_SMALL, [ 10 ] ],
    [ SHAPE_BUS, [ 1, 11, 11, 11, 11, 11, 11, 11, 11, 4 ] ],
    [ SHAPE_ROAD_DEPOT ],
    [ SHAPE_ROAD_BUS_STOP ],
    [ SHAPE_RANGE, [ 8 ]],
    [ SHAPE_BUS, [ 11, 13, 13, 13, 11, 13, 13, 11, 11, 4 ] ],
    [ SHAPE_BUS, [ 1, 8, 8, 8, 1, 8, 8, 8, 8, 4 ] ],
];

const SHAPE_PLANE_INDEX = 0;
const SHAPE_TRAIN1_INDEX = 1;
const SHAPE_CURSOR_INDEX = 2;
const SHAPE_ROAD_NODE_INDEX = 3;
const SHAPE_VEHICLE_BUS_INDEX = 4;
const SHAPE_DYNAMIC_ROAD_INDEX = 5;
const SHAPE_FACTORY_INDEX = 6;
const SHAPE_STATION_INDEX = 7;
const SHAPE_PLANE_SMALL1_INDEX = 8;
const SHAPE_PLANE_SMALL2_INDEX = 9;
const SHAPE_VEHICLE_BUS_YELLOW_INDEX = 10;
const SHAPE_ROAD_DEPOT_INDEX = 11;
const SHAPE_ROAD_BUS_STOP_INDEX = 12;
const SHAPE_RANGE_INDEX = 13;
const SHAPE_VEHICLE_BUS_WHITE_INDEX = 14;
const SHAPE_VEHICLE_BUS_RED_INDEX = 15;

const VD_NAME = 0;
const VD_COST = 1;
const VD_GOODS = 2;
const VD_SHAPE = 3;

const VEHICLE_DEFINITIONS: Array<any> = [
    [ "Basic blue bus", 4000, [ , 20, 0 ], SHAPE_VEHICLE_BUS_INDEX ],
    [ "Red bus", 12000, [ , 60, 60 ], SHAPE_VEHICLE_BUS_RED_INDEX ],
    [ "Yellow bus", 20000, [ , 40, 20 ], SHAPE_VEHICLE_BUS_YELLOW_INDEX ],
    [ "White bus", 50000, [ , 100, 60 ], SHAPE_VEHICLE_BUS_WHITE_INDEX ],
];
