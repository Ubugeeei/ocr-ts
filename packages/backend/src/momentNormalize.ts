import { TecackStroke } from "@tecack/shared";

export function momentNormalize(kanji: Readonly<Array<TecackStroke>>): Array<TecackStroke> {
  const normalizedPattern: Array<TecackStroke> = [];
  const newHeight: number = 256;
  const newWidth: number = 256;
  let xMin: number = 256;
  let xMax: number = 0;
  let yMin: number = 256;
  let yMax: number = 0;

  for (let i = 0; i < kanji.length; i++) {
    const stroke_i = kanji[i];
    for (let j = 0; j < stroke_i.length; j++) {
      const x = stroke_i[j][0];
      const y = stroke_i[j][1];
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
  }

  const oldHeight: number = Math.abs(yMax - yMin);
  const oldWidth: number = Math.abs(xMax - xMin);

  const r2: number = aran(oldWidth, oldHeight);
  let aranWidth: number = newWidth;
  let aranHeight: number = newHeight;

  if (oldHeight > oldWidth) {
    aranWidth = r2 * newWidth;
  } else {
    aranHeight = r2 * newHeight;
  }

  const xOffset: number = (newWidth - aranWidth) / 2;
  const yOffset: number = (newHeight - aranHeight) / 2;

  const m00_ = m00(kanji);
  const m01_ = m01(kanji);
  const m10_ = m10(kanji);

  const xc_ = m10_ / m00_;
  const yc_ = m01_ / m00_;

  const xc_half: number = aranWidth / 2;
  const yc_half: number = aranHeight / 2;

  const mu20_ = mu20(kanji, xc_);
  const mu02_ = mu02(kanji, yc_);

  const alpha: number = aranWidth / (4 * Math.sqrt(mu20_ / m00_));
  const beta: number = aranHeight / (4 * Math.sqrt(mu02_ / m00_));

  for (let i = 0; i < kanji.length; i++) {
    const si = kanji[i];
    const nsi: TecackStroke = [];
    for (let j = 0; j < si.length; j++) {
      const newX: number = alpha * (si[j][0] - xc_) + xc_half;
      const newY: number = alpha * (si[j][1] - yc_) + yc_half;
      nsi.push([newX, newY]);
    }
    normalizedPattern.push(nsi);
  }

  return transform(normalizedPattern, xOffset, yOffset);
}

function m10(pattern: Readonly<Array<TecackStroke>>): number {
  let sum_: number = 0;
  for (let i = 0; i < pattern.length; i++) {
    const stroke_i = pattern[i];
    for (let j = 0; j < stroke_i.length; j++) {
      sum_ += stroke_i[j][0];
    }
  }
  return sum_;
}

function m01(pattern: Readonly<Array<TecackStroke>>): number {
  let sum_: number = 0;
  for (let i = 0; i < pattern.length; i++) {
    const stroke_i = pattern[i];
    for (let j = 0; j < stroke_i.length; j++) {
      sum_ += stroke_i[j][1];
    }
  }
  return sum_;
}

function m00(pattern: Readonly<Array<TecackStroke>>): number {
  let sum_: number = 0;
  for (let i = 0; i < pattern.length; i++) {
    const stroke_i = pattern[i];
    sum_ += stroke_i.length;
  }
  return sum_;
}

function mu20(pattern: Readonly<Array<TecackStroke>>, xc: number): number {
  let sum_: number = 0;
  for (let i = 0; i < pattern.length; i++) {
    const stroke_i = pattern[i];
    for (let j = 0; j < stroke_i.length; j++) {
      const diff = stroke_i[j][0] - xc;
      sum_ += diff * diff;
    }
  }
  return sum_;
}

function mu02(pattern: Readonly<Array<TecackStroke>>, yc: number): number {
  let sum_: number = 0;
  for (let i = 0; i < pattern.length; i++) {
    const stroke_i = pattern[i];
    for (let j = 0; j < stroke_i.length; j++) {
      const diff = stroke_i[j][1] - yc;
      sum_ += diff * diff;
    }
  }
  return sum_;
}

function aran(width: number, height: number): number {
  let r1: number = 0;

  if (height > width) {
    r1 = width / height;
  } else {
    r1 = height / width;
  }

  const a: number = Math.PI / 2;
  const b: number = a * r1;
  const b1: number = Math.sin(b);
  const c: number = Math.sqrt(b1);
  const d: number = c;
  const r2: number = Math.sqrt(Math.sin((Math.PI / 2) * r1));

  return r2;
}

function transform(pattern: Readonly<Array<TecackStroke>>, x: number, y: number): Array<TecackStroke> {
  const p_t: Array<TecackStroke> = [];
  for (let i = 0; i < pattern.length; i++) {
    const si = pattern[i];
    const si_t: TecackStroke = [];
    for (let j = 0; j < si.length; j++) {
      si_t.push([si[j][0] + x, si[j][1] + y]);
    }
    p_t.push(si_t);
  }
  return p_t;
}
