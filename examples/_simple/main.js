import { createTecack, recognize, KANJI_DATA_SET } from "tecack";

const tecack = createTecack(document);

tecack.mount("my-canvas");

window.addEventListener("mouseup", () => {
  const strokes = tecack.getStrokes();
  const candidates = recognize(strokes, KANJI_DATA_SET);
  console.log(candidates); // You can get recognized data (list)
});
