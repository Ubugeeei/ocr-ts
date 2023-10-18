# Stroke Data

## Common Data Structure

In Tecack, we handle stroke data called "Stroke".

A Stroke represents the coordinate information of a single stroke, and any character is represented by an array of these strokes.

Specifically, it adopts the following structure:

```go
// Note: a number is a 64-bit floating-point number

Data       :=   [ { Stroke } ... ]
Stroke     :=   [ { Position } ... ]
Position   :=   X Y
X          :=   number
Y          :=   number

```

::: details TypeScript

```ts
type Data = Array<Stroke>;
type Stroke = Array<Position>;
type Position = [X, Y];
type X = number;
type Y = number;
```

:::

Data inputted through the canvas, and datasets carry this Stroke information.

The recognition algorithms in the backend also handle them.

## Datasets

Datasets carry the following information:

```go
// Note: char is a character represented by a single UTF-16 code unit
// TecackStroke defines the dataset

TecackStroke           :=   TargetChar TargetCharStrokeLength Stroke Stroke
TargetChar             :=   char
TargetCharStrokeLength :=   number
```

::: details TypeScript

```ts
type TecackStroke = [TargetChar, TargetCharStrokeLength, Array<Stroke>];
type TargetChar = string;
type TargetCharStrokeLength = number;
```

:::

## Creating Datasets

To create datasets, primarily two tools are used:

### jTegaki

jTegaki allows you to create stroke data via GUI and outputs a language-independent TecackStroke. The format is XML.  
For detailed usage, please refer to [Tools > jTegaki](/tools/j-tegaki).

### codegen

codegen generates dataset codes based on XML.  
Currently, only TypeScript is supported.  
For detailed usage, please refer to [Tools > codegen](/tools/codegen).
