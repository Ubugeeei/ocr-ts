import type { Stroke } from "@tegaki/shared";
import { CanvasCtxNotFoundError, InitializeError } from "./errors";

export interface Tegaki {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
  flagOver: boolean;
  flagDown: boolean;
  prevX: number;
  currX: number;
  prevY: number;
  currY: number;
  newHeight: number;
  newWidth: number;
  oldHeight: number;
  oldWidth: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  x: number;
  y: number;
  xNorm: number;
  yNorm: number;
  dot_flag: boolean;
  recordedPattern: Array<Stroke>;
  currentLine: Stroke | null;
  s: string;

  /**
   * call Tegaki.init(id) to initialize a canvas as a Tegaki
   *
   * `id` must be the id attribute of the canvas.
   *
   * ex: Tegaki.init('canvas-1');
   */
  init: (id: string) => void | InitializeError;
  draw: (color?: string) => void | CanvasCtxNotFoundError;
  deleteLast: () => void | CanvasCtxNotFoundError;
  erase: () => void | CanvasCtxNotFoundError;

  /**
   * redraw to current canvas according to
   *
   * what is currently stored in Tegaki.recordedPattern
   *
   * add numbers to each stroke
   */
  redraw: () => void | CanvasCtxNotFoundError;
  copyStuff: () => void;
  copyToClipboard: (text: string) => void;
  getStrokes: () => Array<Stroke>;

  find_x_y: (res: string, e: MouseEvent | TouchEvent) => void | CanvasCtxNotFoundError;

  /**
   *
   * modifies hex colors to darken or lighten them
   *
   * ex: Tegaki.alterHex(Tegaki.strokeColors[0], 60, 'dec'); // decrement all colors by 60 (use 'inc' to increment)
   */
  alterHex: (hex: string, number: number, action: "inc" | "dec") => string;
  normalizeLinear: () => void;
}

export function createTegaki(document: Document): Tegaki {
  // private properties
  let canvasId: string = null!;

  // NOTE: Initialized with null or undefined to ensure compatibility with pre-fork implementations.
  const self: Tegaki = {
    canvas: null!,
    ctx: null,
    w: undefined!,
    h: undefined!,
    flagOver: undefined!,
    flagDown: undefined!,
    prevX: undefined!,
    currX: undefined!,
    prevY: undefined!,
    currY: undefined!,
    newHeight: undefined!,
    newWidth: undefined!,
    oldHeight: undefined!,
    oldWidth: undefined!,
    xMin: undefined!,
    xMax: undefined!,
    yMin: undefined!,
    yMax: undefined!,
    x: undefined!,
    y: undefined!,
    xNorm: undefined!,
    yNorm: undefined!,
    dot_flag: undefined!,
    recordedPattern: undefined!,
    currentLine: null,
    s: undefined!,

    init: id => {
      canvasId = id;
      const c = document.getElementById(canvasId);
      if (!c) {
        return new InitializeError(`Canvas#${canvasId} was not found.`);
      }
      if (!(c instanceof HTMLCanvasElement)) {
        return new InitializeError(
          `Canvas#${canvasId} is not an HTMLCanvasElement. got ${c.constructor.name} instead.`,
        );
      }
      self.canvas = c;
      self.canvas.tabIndex = 0; // makes canvas focusable, allowing usage of shortcuts
      self.ctx = self.canvas.getContext("2d");
      self.w = self.canvas.width;
      self.h = self.canvas.height;
      self.flagOver = false;
      self.flagDown = false;
      self.prevX = 0;
      self.currX = 0;
      self.prevY = 0;
      self.currY = 0;
      self.dot_flag = false;
      self.recordedPattern = new Array();
      self.currentLine = null;

      self.canvas.addEventListener(
        "mousemove",
        function (e) {
          self.find_x_y("move", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "mousedown",
        function (e) {
          self.find_x_y("down", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "mouseup",
        function (e) {
          self.find_x_y("up", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "mouseout",
        function (e) {
          self.find_x_y("out", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "mouseover",
        function (e) {
          self.find_x_y("over", e);
        },
        false,
      );

      // touch events
      self.canvas.addEventListener(
        "touchmove",
        function (e) {
          self.find_x_y("move", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "touchstart",
        function (e) {
          self.find_x_y("down", e);
        },
        false,
      );
      self.canvas.addEventListener(
        "touchend",
        function (e) {
          self.find_x_y("up", e);
        },
        false,
      );
    },

    draw: color => {
      if (!self.ctx) {
        return createCanvasError();
      }
      self.ctx.beginPath();
      self.ctx.moveTo(self.prevX, self.prevY);
      self.ctx.lineTo(self.currX, self.currY);
      self.ctx.strokeStyle = color ? color : "#333";
      self.ctx.lineCap = "round";
      //Tegaki.ctx.lineJoin = "round";
      //Tegaki.ctx.lineMiter = "round";
      self.ctx.lineWidth = 4;
      self.ctx.stroke();
      self.ctx.closePath();
    },

    deleteLast: () => {
      if (!self.ctx) {
        return createCanvasError();
      }
      self.ctx.clearRect(0, 0, self.w, self.h);
      for (var i = 0; i < self.recordedPattern.length - 1; i++) {
        var stroke_i = self.recordedPattern[i];
        for (var j = 0; j < stroke_i.length - 1; j++) {
          self.prevX = stroke_i[j][0];
          self.prevY = stroke_i[j][1];

          self.currX = stroke_i[j + 1][0];
          self.currY = stroke_i[j + 1][1];
          self.draw();
        }
      }
      self.recordedPattern.pop();
    },

    erase: () => {
      if (!self.ctx) {
        return createCanvasError();
      }
      self.ctx.clearRect(0, 0, self.w, self.h);
      self.recordedPattern.length = 0;
    },

    find_x_y: (res, e) => {
      const isTouch = isTouchEvent(e);
      var touch = isTouch ? e.changedTouches[0] : null;

      if (isTouch) e.preventDefault(); // prevent scrolling while drawing to the canvas

      if (res == "down") {
        var rect = self.canvas.getBoundingClientRect();
        self.prevX = self.currX;
        self.prevY = self.currY;
        self.currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
        self.currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
        self.currentLine = new Array();
        self.currentLine.push([self.currX, self.currY]);

        self.flagDown = true;
        self.flagOver = true;
        self.dot_flag = true;
        if (self.dot_flag) {
          if (!self.ctx) {
            return createCanvasError();
          }
          self.ctx.beginPath();
          self.ctx.fillRect(self.currX, self.currY, 2, 2);
          self.ctx.closePath();
          self.dot_flag = false;
        }
      }
      if (res == "up") {
        self.flagDown = false;
        if (self.flagOver == true && self.currentLine) {
          self.recordedPattern.push(self.currentLine);
        }
      }

      if (res == "out") {
        self.flagOver = false;
        if (self.flagDown == true && self.currentLine) {
          self.recordedPattern.push(self.currentLine);
        }
        self.flagDown = false;
      }

      if (res == "move") {
        if (self.flagOver && self.flagDown) {
          var rect = self.canvas.getBoundingClientRect();
          self.prevX = self.currX;
          self.prevY = self.currY;
          self.currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
          self.currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
          self.currentLine?.push([self.prevX, self.prevY]);
          self.currentLine?.push([self.currX, self.currY]);
          self.draw();
        }
      }
    },

    redraw: () => {
      if (!self.ctx) {
        return createCanvasError();
      }
      self.ctx.clearRect(0, 0, self.w, self.h);

      // draw strokes
      for (var i = 0; i < self.recordedPattern.length; i++) {
        var stroke_i = self.recordedPattern[i];

        for (var j = 0; j < stroke_i.length - 1; j++) {
          self.prevX = stroke_i[j][0];
          self.prevY = stroke_i[j][1];

          self.currX = stroke_i[j + 1][0];
          self.currY = stroke_i[j + 1][1];
          self.draw(STROKE_COLORS[i]);
        }
      }

      // draw stroke numbers
      if (self.canvas.dataset.strokeNumbers != "false") {
        for (var i = 0; i < self.recordedPattern.length; i++) {
          var stroke_i = self.recordedPattern[i],
            x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5,
            y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;

          self.ctx.font = "20px Arial";

          // outline
          self.ctx.lineWidth = 3;
          self.ctx.strokeStyle = self.alterHex(STROKE_COLORS[i] ? STROKE_COLORS[i] : "#333333", 60, "dec");
          self.ctx.strokeText((i + 1).toString(), x, y);

          // fill
          self.ctx.fillStyle = STROKE_COLORS[i] ? STROKE_COLORS[i] : "#333";
          self.ctx.fillText((i + 1).toString(), x, y);
        }
      }
    },

    alterHex: (hex, number, action) => {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
        color: [string | number, string | number, string | number] = [
          parseInt(result![1], 16),
          parseInt(result![2], 16),
          parseInt(result![3], 16),
        ],
        i = 0,
        j = color.length;

      for (; i < j; i++) {
        switch (action) {
          case "inc":
            color[i] = ((color[i] as number) + number > 255 ? 255 : (color[i] as number) + number).toString(16);
            break;

          case "dec":
            color[i] = ((color[i] as number) - number < 0 ? 0 : (color[i] as number) - number).toString(16);
            break;

          default:
            break;
        }

        // add trailing 0
        if ((color[i] as string).length == 1) color[i] = color[i] + "0";
      }

      return "#" + color.join("");
    },

    normalizeLinear: () => {
      var normalizedPattern = new Array();
      self.newHeight = 256;
      self.newWidth = 256;
      self.xMin = 256;
      self.xMax = 0;
      self.yMin = 256;
      self.yMax = 0;
      // first determine drawn character width / length
      for (var i = 0; i < self.recordedPattern.length; i++) {
        var stroke_i = self.recordedPattern[i];
        for (var j = 0; j < stroke_i.length; j++) {
          self.x = stroke_i[j][0];
          self.y = stroke_i[j][1];
          if (self.x < self.xMin) {
            self.xMin = self.x;
          }
          if (self.x > self.xMax) {
            self.xMax = self.x;
          }
          if (self.y < self.yMin) {
            self.yMin = self.y;
          }
          if (self.y > self.yMax) {
            self.yMax = self.y;
          }
        }
      }
      self.oldHeight = Math.abs(self.yMax - self.yMin);
      self.oldWidth = Math.abs(self.xMax - self.xMin);

      for (var i = 0; i < self.recordedPattern.length; i++) {
        var stroke_i = self.recordedPattern[i];
        var normalized_stroke_i = new Array();
        for (var j = 0; j < stroke_i.length; j++) {
          self.x = stroke_i[j][0];
          self.y = stroke_i[j][1];
          self.xNorm = (self.x - self.xMin) * (self.newWidth / self.oldWidth);
          self.yNorm = (self.y - self.yMin) * (self.newHeight / self.oldHeight);
          normalized_stroke_i.push([self.xNorm, self.yNorm]);
        }
        normalizedPattern.push(normalized_stroke_i);
      }
      self.recordedPattern = normalizedPattern;
      self.redraw();
    },

    copyStuff: () => {
      self.s = "";

      for (var i = 0, j = self.recordedPattern.length; i < j; i++) {
        console.log(i + 1, self.recordedPattern[i], self.recordedPattern[i].toString());
        console.log(self.recordedPattern[i]);
        console.log(JSON.stringify(self.recordedPattern[i]));
        self.s += "[" + JSON.stringify(self.recordedPattern[i]) + "],";
      }

      self.copyToClipboard(self.s);
    },

    copyToClipboard: str => {
      var el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },

    getStrokes: () => {
      return self.recordedPattern;
    },
  };

  // event listener for shortcuts
  document.addEventListener("keydown", function (e) {
    if (self.canvas && e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        // undo
        case "z":
          e.preventDefault();
          self.deleteLast();
          break;

        // erase
        case "x":
          e.preventDefault();
          self.erase();
          break;

        default:
          break;
      }
    }
  });

  const createCanvasError = () =>
    new CanvasCtxNotFoundError(`CanvasRenderingContext2D for Canvas#${canvasId} was not found.`);

  const isTouchEvent = (e: unknown): e is TouchEvent => typeof e === "object" && e !== null && "changedTouches" in e;

  return self;
}

// color coded stroke colors (for 30 strokes)
// based on https://kanjivg.tagaini.net/viewer.html
const STROKE_COLORS = [
  "#bf0000",
  "#bf5600",
  "#bfac00",
  "#7cbf00",
  "#26bf00",
  "#00bf2f",
  "#00bf85",
  "#00a2bf",
  "#004cbf",
  "#0900bf",
  "#5f00bf",
  "#b500bf",
  "#bf0072",
  "#bf001c",
  "#bf2626",
  "#bf6b26",
  "#bfaf26",
  "#89bf26",
  "#44bf26",
  "#26bf4c",
  "#26bf91",
  "#26a8bf",
  "#2663bf",
  "#2d26bf",
  "#7226bf",
  "#b726bf",
  "#bf2682",
  "#bf263d",
  "#bf4c4c",
  "#bf804c",
];
