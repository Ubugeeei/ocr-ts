import "./style.css";

import { createTecack } from "@tecack/frontend";
import { KANJI_DATA_SET } from "@tecack/dataset";

const tecack = createTecack(document);
tecack.mount("#viewer");

const charInput = document.getElementById("char-input") as HTMLInputElement | null;
if (charInput) {
  charInput.addEventListener("input", e => {
    const [_, __, strokes] = KANJI_DATA_SET.find(([char]) => char === (e.target as HTMLInputElement).value) ?? [];
    if (strokes) {
      tecack.restoreFromStrokes(strokes);
      tecack.redraw();
    }
  });
}
