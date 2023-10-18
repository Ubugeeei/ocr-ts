import "./style.css";

import { createTecack } from "@tecack/frontend";
import { encodeStroke } from "@tecack/shared";

const tecack = createTecack(document);
tecack.mount("#tecack-sample");

let encode = false;
const toggleEncodeInput = document.getElementById("toggle-encode-input")!;
toggleEncodeInput.addEventListener("click", e => {
  encode = (e.target as HTMLInputElement).checked;
});

const recognizeBtn = document.getElementById("recognize-btn")!;
recognizeBtn.addEventListener("click", async () => {
  const strokes = tecack.getStrokes();
  const candidate = await fetch(`http://localhost:3000/recognize${encode ? "-encoded" : ""}`, {
    method: "POST",
    body: JSON.stringify({ strokes: encode ? encodeStroke(strokes) : strokes }),
  }).then(res => res.json());
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
