import "./style.css";

import { createTecack } from "@tecack/frontend";
import { recognize } from "@tecack/backend";
import { KANJI_DATA_SET } from "@tecack/dataset";
import { HIRAGANA_DATA } from "./hiragana";

const tecack = createTecack({
  backgroundPainter: canvas => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [w, h] = [canvas.width, canvas.height];
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#4bc4cc"; // secondary
    ctx.strokeRect(0, 0, w, h);
  },
});

const candidateContainer = document.getElementById("candidate-container")!;

const rec = () => {
  const strokes = tecack.getStrokes();
  const candidate = recognize(strokes, [...HIRAGANA_DATA, ...KANJI_DATA_SET]);
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
tecack.mount("#tecack-sample");
