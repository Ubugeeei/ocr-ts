# Getting Started

## Installation

::: code-group

<<< @/snipets/installation/npm
<<< @/snipets/installation/pnpm
<<< @/snipets/installation/yarn
<<< @/snipets/installation/bun

:::

## Simple Usage

### 1. write html

- create a canvas element with id

```html
<canvas id="my-canvas" width="500" height="500" style="background: #efefef"></canvas>
```

### 2. setup tecack in js

```ts
import { createTecack, recognize, KANJI_DATA_SET } from "tecack";

const tecack = createTecack(document);

tecack.init("my-canvas");

window.addEventListener("mouseup", () => {
  const strokes = tecack.getStrokes();
  const candidates = recognize(strokes, KANJI_DATA_SET);
  console.log(candidates); // You can get recognized data (list)
});
```
