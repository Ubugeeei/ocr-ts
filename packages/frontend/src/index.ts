import type { Stroke } from "@tecack/shared";
import { CanvasCtxNotFoundError, InitializeError } from "./errors";

export * from "./errors";

export interface Tecack {
  /**
   * call Tecack.init(id) to initialize a canvas as a Tecack
   *
   * `id` must be the id attribute of the canvas.
   *
   * ex: Tecack.init('canvas-1');
   */
  init: (id: string) => void | InitializeError;
  draw: (color?: string) => void | CanvasCtxNotFoundError;
  deleteLast: () => void | CanvasCtxNotFoundError;
  erase: () => void | CanvasCtxNotFoundError;
  copyStuff: () => void;

  /**
   * redraw to current canvas according to
   *
   * what is currently stored in Tecack.recordedPattern
   *
   * add numbers to each stroke
   */
  redraw: () => void | CanvasCtxNotFoundError;
  getStrokes: () => Readonly<Array<Stroke>>;
  restoreFromStrokes(strokesMut: Array<Stroke>): void;
  normalizeLinear: () => void;
}

export function createTecack(document: Document): Tecack {
  // private properties
  let _canvasId: string;
  let _canvas: HTMLCanvasElement;
  let _ctx: CanvasRenderingContext2D | null;
  let _w: number;
  let _h: number;
  let _flagOver: boolean;
  let _flagDown: boolean;
  let _prevX: number;
  let _currX: number;
  let _prevY: number;
  let _currY: number;
  let _newHeight: number;
  let _newWidth: number;
  let _oldHeight: number;
  let _oldWidth: number;
  let _xMin: number;
  let _xMax: number;
  let _yMin: number;
  let _yMax: number;
  let _x: number;
  let _y: number;
  let _xNorm: number;
  let _yNorm: number;
  let _dot_flag: boolean;
  let _recordedPattern: Array<Stroke>;
  let _currentLine: Stroke | null;
  let _s: string;

  // NOTE: Initialized with null or undefined to ensure compatibility with pre-fork implementations.
  const tecack: Tecack = {
    init: id => {
      _canvasId = id;
      const c = document.getElementById(_canvasId);
      if (!c) {
        return new InitializeError(`Canvas#${_canvasId} was not found.`);
      }
      if (!(c instanceof HTMLCanvasElement)) {
        return new InitializeError(
          `Canvas#${_canvasId} is not an HTMLCanvasElement. got ${c.constructor.name} instead.`,
        );
      }
      _canvas = c;
      _canvas.tabIndex = 0; // makes canvas focusable, allowing usage of shortcuts
      _ctx = _canvas.getContext("2d");
      _w = _canvas.width;
      _h = _canvas.height;
      _flagOver = false;
      _flagDown = false;
      _prevX = 0;
      _currX = 0;
      _prevY = 0;
      _currY = 0;
      _dot_flag = false;
      _recordedPattern = new Array();
      _currentLine = null;

      _canvas.addEventListener(
        "mousemove",
        function (e) {
          _find_x_y("move", e);
        },
        false,
      );
      _canvas.addEventListener(
        "mousedown",
        function (e) {
          _find_x_y("down", e);
        },
        false,
      );
      _canvas.addEventListener(
        "mouseup",
        function (e) {
          _find_x_y("up", e);
        },
        false,
      );
      _canvas.addEventListener(
        "mouseout",
        function (e) {
          _find_x_y("out", e);
        },
        false,
      );
      _canvas.addEventListener(
        "mouseover",
        function (e) {
          _find_x_y("over", e);
        },
        false,
      );

      // touch events
      _canvas.addEventListener(
        "touchmove",
        function (e) {
          _find_x_y("move", e);
        },
        false,
      );
      _canvas.addEventListener(
        "touchstart",
        function (e) {
          _find_x_y("down", e);
        },
        false,
      );
      _canvas.addEventListener(
        "touchend",
        function (e) {
          _find_x_y("up", e);
        },
        false,
      );
    },

    draw: color => {
      if (!_ctx) {
        return createCanvasError();
      }
      _ctx.beginPath();
      _ctx.moveTo(_prevX, _prevY);
      _ctx.lineTo(_currX, _currY);
      _ctx.strokeStyle = color ? color : "#333";
      _ctx.lineCap = "round";
      //Tecack.ctx.lineJoin = "round";
      //Tecack.ctx.lineMiter = "round";
      _ctx.lineWidth = 4;
      _ctx.stroke();
      _ctx.closePath();
    },

    deleteLast: () => {
      if (!_ctx) {
        return createCanvasError();
      }
      _ctx.clearRect(0, 0, _w, _h);
      for (var i = 0; i < _recordedPattern.length - 1; i++) {
        var stroke_i = _recordedPattern[i];
        for (var j = 0; j < stroke_i.length - 1; j++) {
          _prevX = stroke_i[j][0];
          _prevY = stroke_i[j][1];

          _currX = stroke_i[j + 1][0];
          _currY = stroke_i[j + 1][1];
          tecack.draw();
        }
      }
      _recordedPattern.pop();
    },

    erase: () => {
      if (!_ctx) {
        return createCanvasError();
      }
      _ctx.clearRect(0, 0, _w, _h);
      _recordedPattern.length = 0;
    },

    redraw: () => {
      if (!_ctx) {
        return createCanvasError();
      }
      _ctx.clearRect(0, 0, _w, _h);

      // draw strokes
      for (var i = 0; i < _recordedPattern.length; i++) {
        var stroke_i = _recordedPattern[i];

        for (var j = 0; j < stroke_i.length - 1; j++) {
          _prevX = stroke_i[j][0];
          _prevY = stroke_i[j][1];

          _currX = stroke_i[j + 1][0];
          _currY = stroke_i[j + 1][1];
          tecack.draw(STROKE_COLORS[i]);
        }
      }

      // draw stroke numbers
      if (_canvas.dataset.strokeNumbers != "false") {
        for (var i = 0; i < _recordedPattern.length; i++) {
          var stroke_i = _recordedPattern[i],
            x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5,
            y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;

          _ctx.font = "20px Arial";

          // outline
          _ctx.lineWidth = 3;
          _ctx.strokeStyle = _alterHex(STROKE_COLORS[i] ? STROKE_COLORS[i] : "#333333", 60, "dec");
          _ctx.strokeText((i + 1).toString(), x, y);

          // fill
          _ctx.fillStyle = STROKE_COLORS[i] ? STROKE_COLORS[i] : "#333";
          _ctx.fillText((i + 1).toString(), x, y);
        }
      }
    },

    normalizeLinear: () => {
      var normalizedPattern = new Array();
      _newHeight = 256;
      _newWidth = 256;
      _xMin = 256;
      _xMax = 0;
      _yMin = 256;
      _yMax = 0;
      // first determine drawn character width / length
      for (var i = 0; i < _recordedPattern.length; i++) {
        var stroke_i = _recordedPattern[i];
        for (var j = 0; j < stroke_i.length; j++) {
          _x = stroke_i[j][0];
          _y = stroke_i[j][1];
          if (_x < _xMin) {
            _xMin = _x;
          }
          if (_x > _xMax) {
            _xMax = _x;
          }
          if (_y < _yMin) {
            _yMin = _y;
          }
          if (_y > _yMax) {
            _yMax = _y;
          }
        }
      }
      _oldHeight = Math.abs(_yMax - _yMin);
      _oldWidth = Math.abs(_xMax - _xMin);

      for (var i = 0; i < _recordedPattern.length; i++) {
        var stroke_i = _recordedPattern[i];
        var normalized_stroke_i = new Array();
        for (var j = 0; j < stroke_i.length; j++) {
          _x = stroke_i[j][0];
          _y = stroke_i[j][1];
          _xNorm = (_x - _xMin) * (_newWidth / _oldWidth);
          _yNorm = (_y - _yMin) * (_newHeight / _oldHeight);
          normalized_stroke_i.push([_xNorm, _yNorm]);
        }
        normalizedPattern.push(normalized_stroke_i);
      }
      _recordedPattern = normalizedPattern;
      tecack.redraw();
    },

    copyStuff: () => {
      _s = "";
      for (var i = 0, j = _recordedPattern.length; i < j; i++) {
        console.log(i + 1, _recordedPattern[i], _recordedPattern[i].toString());
        console.log(_recordedPattern[i]);
        console.log(JSON.stringify(_recordedPattern[i]));
        _s += "[" + JSON.stringify(_recordedPattern[i]) + "],";
      }
      _copyToClipboard(_s);
    },

    getStrokes: () => {
      return _recordedPattern;
    },

    restoreFromStrokes: strokesMut => {
      _recordedPattern = strokesMut;
      for (var i = 0; i < _recordedPattern.length; i++) {
        var stroke_i = _recordedPattern[i];
        for (var j = 0; j < stroke_i.length - 1; j++) {
          _prevX = stroke_i[j][0];
          _prevY = stroke_i[j][1];
          _currX = stroke_i[j + 1][0];
          _currY = stroke_i[j + 1][1];
          tecack.draw();
        }
      }
    },
  };

  const _copyToClipboard = (str: string) => {
    var el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  const _find_x_y = (res: string, e: MouseEvent | TouchEvent): void | CanvasCtxNotFoundError => {
    const isTouch = isTouchEvent(e);
    var touch = isTouch ? e.changedTouches[0] : null;

    if (isTouch) e.preventDefault(); // prevent scrolling while drawing to the canvas

    if (res == "down") {
      var rect = _canvas.getBoundingClientRect();
      _prevX = _currX;
      _prevY = _currY;
      _currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
      _currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
      _currentLine = new Array();
      _currentLine.push([_currX, _currY]);

      _flagDown = true;
      _flagOver = true;
      _dot_flag = true;
      if (_dot_flag) {
        if (!_ctx) {
          return createCanvasError();
        }
        _ctx.beginPath();
        _ctx.fillRect(_currX, _currY, 2, 2);
        _ctx.closePath();
        _dot_flag = false;
      }
    }
    if (res == "up") {
      _flagDown = false;
      if (_flagOver == true && _currentLine) {
        _recordedPattern.push(_currentLine);
      }
    }

    if (res == "out") {
      _flagOver = false;
      if (_flagDown == true && _currentLine) {
        _recordedPattern.push(_currentLine);
      }
      _flagDown = false;
    }

    if (res == "move") {
      if (_flagOver && _flagDown) {
        var rect = _canvas.getBoundingClientRect();
        _prevX = _currX;
        _prevY = _currY;
        _currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
        _currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
        _currentLine?.push([_prevX, _prevY]);
        _currentLine?.push([_currX, _currY]);
        tecack.draw();
      }
    }
  };

  /**
   *
   * modifies hex colors to darken or lighten them
   *
   * ex: Tecack.alterHex(Tecack.strokeColors[0], 60, 'dec'); // decrement all colors by 60 (use 'inc' to increment)
   */
  const _alterHex = (hex: string, number: number, action: "inc" | "dec"): string => {
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
  };

  // event listener for shortcuts
  document.addEventListener("keydown", function (e) {
    if (_canvas && e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        // undo
        case "z":
          e.preventDefault();
          tecack.deleteLast();
          break;

        // erase
        case "x":
          e.preventDefault();
          tecack.erase();
          break;

        default:
          break;
      }
    }
  });

  const createCanvasError = () =>
    new CanvasCtxNotFoundError(`CanvasRenderingContext2D for Canvas#${_canvasId} was not found.`);

  const isTouchEvent = (e: unknown): e is TouchEvent => typeof e === "object" && e !== null && "changedTouches" in e;

  return tecack;
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
