# API Reference

## @tecack/frontend

### createTecack()

Creates Tecack instance for drawing on canvas.

- #### Type

  ```ts
  function createTecack(options?: TecackOptions): Tecack;
  ```

- #### Example

  ```ts
  import { createTecack } from "@tecack/frontend";

  const tecack = createTecack();
  ```

### TecackOptions.backgroundPainter

- #### Type

  ```ts
  export interface TecackOptions {
    backgroundPainter?: (el: HTMLCanvasElement) => void;
  }
  ```

- #### Example

  if you want to paint fixed background, configure background painter

  ```ts
  import { createTecack } from "@tecack/frontend";

  const tecack = createTecack({
    backgroundPainter: canvas => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const [w, h] = [el.width, el.height];
      ctx.fillStyle = "#ccc";
      ctx.fillRect(0, 0, w, h);
    },
  });
  ```

### Tecack.mount()

Mounts Tecack instance to canvas element.

- #### Type

  ```ts
  function mount(selector: string): void | InitializeError;
  ```

- #### Example

  ```ts
  import { createTecack, InitializeError } from "@tecack/frontend";

  const tecack = createTecack();
  const res = tecack.mount("#my-canvas");
  if (res instanceof InitializeError) {
    // handle error
  }
  ```

### Tecack.unmount()

unmounts canvas element from Tecack instance.

The contents of the tecack instance are retained, only the association with the DOM is removed.  
(Discard retention of event listeners and $el's.)

In the default state, canvas is cleaned up and the drawing content is overwritten in the background if backgroundPainter is set.

- #### Type

  ```ts
  function mount(options?: {
    /** default: `true` */
    cleanCanvas?: boolean;
    /**
     * default: `false`
     *
     * When this option is enabled, the cleanCanvas option is ignored.
     */
    force?: boolean;
  }): void;
  ```

- #### Example

  ```ts
  import { createTecack, InitializeError } from "@tecack/frontend";

  const tecack = createTecack();
  tecack.mount("#my-canvas");
  tecack.unmount();
  ```

  ```ts
  // setting cleanCanvas to false will keep the current canvas drawing state
  tecack.unmount({ cleanCanvas: false });
  ```

  ```ts
  // umount the canvas with a complete cleanup (Background is not rendered.)
  tecack.unmount({ force: false });
  ```

### Tecack.deleteLast()

Deletes last stroke from canvas and instance internal data.

- #### Type

  ```ts
  function deleteLast(): void | CanvasCtxNotFoundError;
  ```

- #### Example

  ```ts
  import { createTecack, CanvasCtxNotFoundError } from "@tecack/frontend";

  const tecack = createTecack();
  tecack.mount("#my-canvas");

  const deleteLastButton = document.getElementById("delete-last");
  deleteLastButton.addEventListener("click", () => {
    const res = tecack.deleteLast();
    if (res instanceof CanvasCtxNotFoundError) {
      // handle error
    }
  });
  ```

### Tecack.erase()

Erases all strokes from canvas and instance internal data.

- #### Type

  ```ts
  function erase(): void | CanvasCtxNotFoundError;
  ```

- #### Example

  ```ts
  import { createTecack, CanvasCtxNotFoundError } from "@tecack/frontend";

  const tecack = createTecack();
  tecack.mount("#my-canvas");

  const eraseButton = document.getElementById("erase");
  eraseButton.addEventListener("click", () => {
    const res = tecack.erase();
    if (res instanceof CanvasCtxNotFoundError) {
      // handle error
    }
  });
  ```

### Tecack.getStrokes()

Get strokes data from instance internal.  
You can use this data for restore strokes or backend recognition.

- #### Type

  ```ts
  function getStrokes(): Readonly<Array<TecackStroke>>;
  ```

- #### Example

  ```ts
  import { createTecack } from "@tecack/frontend";

  const tecack = createTecack();
  tecack.mount("#my-canvas");

  const strokes = tecack.getStrokes();
  console.log(strokes);
  ```

  ```ts
  import { recognize } from "@tecack/backend";

  const strokes = tecack.getStrokes();
  const candidates = recognize(strokes);
  ```

### Tecack.restoreFromStrokes()

Restores canvas strokes and internal data from existing strokes data.

- #### Type

  ```ts
  function restoreFromStrokes(
    strokesMut: Readonly<Array<TecackStroke>>,
    options?: {
      /** default: `true` */
      withDraw: boolean;
    },
  ): void;
  ```

- #### Example

  ```ts
  const strokes = JSON.parse(localStorage.getItem("strokes"));
  tecack.restoreFromStrokes(strokes);
  ```

### Tecack.drawStrokeOrder()

It draws the stroke order on the strokes entered into the Canvas.

- #### Type

  ```ts
  function drawStrokeOrder(options?: DrawStrokeOrderOptions): void | CanvasCtxNotFoundError;
  ```

- #### Example

  ```ts
  tecack.drawStrokeOrder();
  ```

### DrawStrokeOrderOptions

Options for `Tecack.drawStrokeOrder()`

- #### Type

  ```ts
  export interface DrawStrokeOrderOptions {
    withColor?: boolean;
    colorSet?: Array<string>;
    font?: {
      family?: string;
      size?: string;
    };
  }
  ```

#### DrawStrokeOrderOptions.withColor

When `withColor` is enabled, it draws each stroke in a different color.  
This is to make it easier to understand which stroke order corresponds to which stroke.  
Please refer to the `colorSet` to see which colors will be used for the drawing.

default: `false`

#### DrawStrokeOrderOptions.colorSet

This is the set of colors used when `withColor` is enabled.  
The index of the color set (array) corresponds to the stroke order, and if the stroke order exceeds the length of the color set, it will cycle through.

::: warning
Please note that the colors (strings) registered as `colorSet` **must be six-digit hexadecimal numbers starting with `#`**.  
(Shortened three-digit notation, specific color names, and rgb notation cannot be used.)
:::

default:

```ts
// prettier-ignore
/** based on https://kanjivg.tagaini.net/viewer.html */
[
  "#bf0000", "#bf5600", "#bfac00", "#7cbf00", "#26bf00",
  "#00bf2f", "#00bf85", "#00a2bf", "#004cbf", "#0900bf",
  "#5f00bf", "#b500bf", "#bf0072", "#bf001c", "#bf2626",
  "#bf6b26", "#bfaf26", "#89bf26", "#44bf26", "#26bf4c",
  "#26bf91", "#26a8bf", "#2663bf", "#2d26bf", "#7226bf",
  "#b726bf", "#bf2682", "#bf263d", "#bf4c4c", "#bf804c",
]
```

#### DrawStrokeOrderOptions.font

This is the font used when drawing the stroke order.

default:

```ts
{
  family: "helvetica", // inspired by https://kanjivg.tagaini.net
  size: "16px",
}
```

## @tecack/backend

### recognize()

Recognizes strokes data and returns candidates.

- #### Type

  <!-- prettier-ignore -->
  ```ts
  function recognize(
    input: Readonly<Array<TecackStroke>>, 
    dataset: Readonly<Array<TecackDataset>>
  ): string[];
  ```

- #### Example

  ```ts
  import { recognize } from "@tecack/backend";
  import { KANJI_DATASET } from "@tecack/dataset";

  const candidates = recognize(strokes, [...KANJI_DATASET, ...myDataset]);
  ```

## @tecack/shared

### encodeStroke() / decodeStroke()

Encodes `Array<TecackStroke>` data to minimize size.  
And, decodes encoded string.

- #### Type

  ```ts
  function encodeStroke(strokes: Readonly<Array<TecackStroke>>): string;
  function decodeStroke(encoded: string): Array<TecackStroke> | DecodeError;
  ```

- #### Example

  ```ts
  // on client
  import { encodeStroke } from "@tecack/shared";

  const recBtn = document.getElementById("recognize-btn");
  recBtn.addEventListener("click", async () => {
    const strokes = tecack.getStrokes();
    const encoded = encodeStroke(strokes); // here
    const res = await fetch("http://my-api.dev/recognize", {
      method: "POST",
      body: JSON.stringify({ strokes: encoded }),
    });
  });
  ```

  ```ts
  // on server
  import { decodeStroke } from "@tecack/shared";
  import { recognize } from "@tecack/backend";
  import { KANJI_DATASET } from "@tecack/dataset";

  // ex1: recognize
  app.post("/recognize", async c => {
    const req = await c.req.json();
    const decoded = decodeStroke(req.strokes); // here
    if (decoded instanceof DecodeError) {
      return c.json({ error: decoded.message });
    }
    const candidate = recognize(decoded, KANJI_DATA_SET);
    return c.json(candidate);
  });

  // ex2: save to database as encoded text data
  app.post("/save-stroke", async c => {
    const req = await c.req.json();
    await myDb.save(req.strokes); // save to database as encoded text data
    return c.json({ ok: true });
  });
  ```
