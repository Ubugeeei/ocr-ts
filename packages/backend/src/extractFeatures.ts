import { Position, TecackStroke } from "@tecack/shared";

export function extractFeatures(kanji: Array<TecackStroke>, interval: number): Array<TecackStroke> {
  const extractedPattern: Array<TecackStroke> = [];
  const nrStrokes: number = kanji.length;

  for (let i = 0; i < nrStrokes; i++) {
    const stroke_i = kanji[i];
    const extractedStroke_i: TecackStroke = [];
    let dist: number = 0.0;
    let j: number = 0;

    while (j < stroke_i.length) {
      if (j === 0) {
        const x1y1 = stroke_i[0];
        extractedStroke_i.push(x1y1);
      }

      if (j > 0) {
        const x1y1 = stroke_i[j - 1];
        const x2y2 = stroke_i[j];
        dist += euclid(x1y1, x2y2);
      }

      if (dist >= interval && j > 1) {
        // Fixed typo 'y' to 'j'
        dist = dist - interval;
        const x1y1 = stroke_i[j];
        extractedStroke_i.push(x1y1);
      }
      j++;
    }

    if (extractedStroke_i.length === 1) {
      const x1y1 = stroke_i[stroke_i.length - 1];
      extractedStroke_i.push(x1y1);
    } else {
      if (dist > 0.75 * interval) {
        const x1y1 = stroke_i[stroke_i.length - 1];
        extractedStroke_i.push(x1y1);
      }
    }
    extractedPattern.push(extractedStroke_i);
  }
  return extractedPattern;
}

function euclid(x1y1: Position, x2y2: Position): number {
  const a: number = x1y1[0] - x2y2[0];
  const b: number = x1y1[1] - x2y2[1];
  const c: number = Math.sqrt(a * a + b * b);
  return c;
}
