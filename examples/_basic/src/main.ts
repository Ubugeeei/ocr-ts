import "./style.css";

import { createTecack } from "@tecack/frontend";
import { recognize } from "@tecack/backend";
import { KANJI_DATA_SET } from "@tecack/dataset";

const tecack = createTecack(document);
tecack.mount("tecack-sample");

const candidateContainer = document.getElementById("candidate-container")!;

const rec = () => {
  const strokes = tecack.getStrokes();
  const candidate = recognize(strokes, KANJI_DATA_SET);
  candidateContainer.textContent = candidate.join(", ");
};

const undoBtn = document.getElementById("undo-btn");
undoBtn &&
  undoBtn.addEventListener("click", () => {
    tecack.deleteLast();
    tecack.getStrokes().length ? rec() : (candidateContainer.textContent = "");
  });

const eraseBtn = document.getElementById("erase-btn");
eraseBtn &&
  eraseBtn.addEventListener("click", () => {
    tecack.erase();
    candidateContainer.textContent = "";
  });

window.addEventListener("mouseup", () => rec());
window.addEventListener("touchend", () => rec());
