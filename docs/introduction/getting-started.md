# Getting Started

## Installation

::: code-group

<<< @/snipets/installation/npm
<<< @/snipets/installation/pnpm
<<< @/snipets/installation/yarn
<<< @/snipets/installation/bun

:::

or install partial packages (e.g. `@tecack/frontend`: [read more documentation](/reference/packages))

## Simple Usage on Browser

```html
<canvas id="my-canvas" width="500" height="500" style="background: #efefef"></canvas>
```

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

## Client - Server Separation

```ts
// client
import { createTecack } from "@tecack/frontend";

const tecack = createTecack(document);

tecack.init("my-canvas");

window.addEventListener("mouseup", async () => {
  const strokes = tecack.getStrokes();
  const res = await fetch("http://localhost:3000/recognize", {
    method: "POST",
    body: JSON.stringify({ strokes }),
  });
  console.log(await res.json()); // You can get recognized data (list)
});
```

```ts
// server with hono
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { recognize } from "@tecack/backend";
import { KANJI_DATA_SET } from "@tecack/dataset";

const app = new Hono();

app.post("/recognize", async c => {
  const req = await c.req.json();
  const candidate = recognize(req.strokes, KANJI_DATA_SET);
  return c.json(candidate);
});

serve({ fetch: app.fetch, port: 3000 });
```
