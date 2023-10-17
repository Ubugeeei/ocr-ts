import { KANJI_DATA_SET } from "@tecack/dataset";
import { recognize } from "@tecack/backend";
import { createTecack } from "@tecack/frontend";

const tecack = createTecack(document);
tecack.init("tecack-sample");

const recognizeBtn = document.getElementById("recognize-btn")!;
recognizeBtn.addEventListener("click", () => {
  const strokes = tecack.getStrokes();
  const candidate = recognize(strokes, KANJI_DATA_SET);
  const candidateContainer = document.getElementById("candidate-container")!;
  candidateContainer.textContent = candidate.join(", ");
});

const undoBtn = document.getElementById("undo-btn")!;
undoBtn.addEventListener("click", () => {
  tecack.deleteLast();
});

const eraseBtn = document.getElementById("erase-btn")!;
eraseBtn.addEventListener("click", () => {
  tecack.erase();
});
