/**
 * The TecackDataset.
 *
 * @example ["字", 6, [..]]
 */
export type TecackDataset = [TargetChar, TargetCharStrokeLength, TecackStrokes];

export type TargetChar = string;

export type TargetCharStrokeLength = number;

/** Stroke information for any single character. */
export type TecackStrokes = Array<TecackStroke>;

/** Information on a single stroke of any single character. */
export type TecackStroke = Array<Position>;

export type Position = [X, Y];

export type X = number;

export type Y = number;
