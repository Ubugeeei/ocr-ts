export type TecackDataset = [TargetChar, TargetCharStrokeLength, Array<TecackStroke>];

export type TargetChar = string;

export type TargetCharStrokeLength = number;

export type TecackStroke = Array<Position>;

export type Position = [X, Y];

export type X = number;

export type Y = number;
