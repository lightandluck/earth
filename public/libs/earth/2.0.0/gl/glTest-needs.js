/* harmony import */ var _projection_orthographic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../projection/orthographic */ "./src/projection/orthographic.mjs");
/* harmony import */ var _palette_palette__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../palette/palette */ "./src/palette/palette.mjs");
/* harmony import */ var _grid_regular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../grid/regular */ "./src/grid/regular.mjs");
/* harmony import */ var _interpolate_bilinear__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../interpolate/bilinear */ "./src/interpolate/bilinear.mjs");
/* harmony import */ var _fastoverlay__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./fastoverlay */ "./src/gl/fastoverlay.mjs");
/* harmony import */ var _canvas_twod__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../canvas/twod */ "./src/canvas/twod.mjs");
/* harmony import */ var _d3__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../d3 */ "./src/d3.mjs");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var _glu__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./glu */ "./src/gl/glu.mjs");









var width = 300,
    height = 300,
    pixelRatio = 1;
var proj = Object(_projection_orthographic__WEBPACK_IMPORTED_MODULE_0__["default"])(width / 2, 0, 0, width / 2, width / 2);
var grid = Object(_grid_regular__WEBPACK_IMPORTED_MODULE_2__["default"])({
  "start": 0,
  "delta": 120,
  "size": 3
}, {
  "start": 60,
  "delta": -60,
  "size": 3
});
var data = new Float32Array([//  u  v     len
1, 0, // 1
2, 0, // 2
3, 0, // 3
4, 0, // 4
5, 0, // 5
8, 0, // 8
6, 0, // 6
8, 0, // 8
7e37, 7e37]);
var field = Object(_interpolate_bilinear__WEBPACK_IMPORTED_MODULE_3__["vector"])(grid, data);
var scale = Object(_palette_palette__WEBPACK_IMPORTED_MODULE_1__["buildScaleFromSegments"])([0, 7], [[0, [255, 255, 255]], [1, [0, 0, 255]], [2, [0, 255, 0]], [3, [0, 255, 255]], [4, [255, 0, 0]], [5, [255, 0, 255]], [6, [255, 255, 0]], [7, [255, 255, 255]]], 8);
function runTest(show) {
  console.time("glTest");
  var res = {
    pass: false
  };

  try {
    var sample = function sample(x, y) {
      var out = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return out;
    };

    var canvas = _canvas_twod__WEBPACK_IMPORTED_MODULE_5__["createCanvas"](width, height);

    if (show) {
      _d3__WEBPACK_IMPORTED_MODULE_6__["select"](canvas).style("width", "".concat(width / pixelRatio, "px")).style("height", "".concat(height / pixelRatio, "px")).style("position", "absolute").style("top", "0").style("left", "0");
      _d3__WEBPACK_IMPORTED_MODULE_6__["select"]("#display").node().appendChild(canvas);
    }

    var gl = _glu__WEBPACK_IMPORTED_MODULE_8__["default"].getWebGL(canvas);

    if (!gl) {
      res.hasContext = false;
      return res;
    }

    var maxTexSize = +gl.getParameter(gl.MAX_TEXTURE_SIZE) || -1;

    if (maxTexSize < 4096) {
      res.maxTexSize = maxTexSize; // data layers up to this size are expected.

      return res;
    }

    var precision = +gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision || -1;

    if (precision < 23) {
      res.precision = precision; // not enough precision for expected data layers.

      return res;
    }

    res.scenario = 1;
    var drawResult = Object(_fastoverlay__WEBPACK_IMPORTED_MODULE_4__["default"])(canvas, undefined, function () {
      return 1;
    }, function () {
      return {
        width: width,
        height: height,
        pixelRatio: pixelRatio
      };
    }, function (glu) {
      return [proj.webgl(glu), grid.webgl(glu), field.webgl(glu), scale.webgl(glu)];
    }).draw();

    if (drawResult.err) {
      res.err = drawResult.err;
      return res;
    }

    var colorMatch = [Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 20), [0, 0, 255, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 48), [0, 255, 0, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 90), [0, 255, 255, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 150), [255, 0, 0, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 200), [255, 0, 255, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 260), [255, 255, 0, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(195, 300 - 285), [255, 255, 255, 255]), Object(_micro__WEBPACK_IMPORTED_MODULE_7__["arraysEq"])(sample(145, 300 - 285), [0, 0, 0, 0])];

    if (colorMatch.some(function (e) {
      return e === false;
    })) {
      res.colorMatch = colorMatch; // the expected rendering is wrong so this webgl implementation is suspect.

      return res;
    }

    var err = gl.getError();

    if (err !== 0) {
      res.err = err;
    } else {
      res.pass = true;
    }
  } catch (e) {
    res.err = e.toString();
  } finally {
    console.timeEnd("glTest");
  }

  return res;
}