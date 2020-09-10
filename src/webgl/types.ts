type tColorDefinition = Array<number>;
type tColorPalette = Array<tColorDefinition>;
type tShapeWebglDefinition = [ Float32Array, Uint16Array, Uint8Array ];
type tShapeDefinition = Array<number>;
type tHslaArray = Array<number>;
type tRgbaArray = Array<number>;
type tLocalColorIndex = number;

type tShapeDefinitionV2 = [ tShapeDefinition ] | [ tShapeDefinition, Array<tLocalColorIndex> ];
