/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./consts */ "./src/consts.mjs");
/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");
/* harmony import */ var _d3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./d3 */ "./src/d3.mjs");
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./math */ "./src/math.mjs");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./micro */ "./src/micro.mjs");
/* harmony import */ var _projection_orthographic__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./projection/orthographic */ "./src/projection/orthographic.mjs");
/* harmony import */ var _canvas_twod__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./canvas/twod */ "./src/canvas/twod.mjs");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * globes - a set of models of the earth, each having their own kind of projection and onscreen behavior.
 *
 * Copyright (c) 2018 Cameron Beccario
 *
 * For a free version of this project, see https://github.com/cambecc/earth
 */







/**
 * @returns {Array} rotation of globe to current position of the user. Aside from asking for geolocation,
 *          which user may reject, there is not much available except timezone. Better than nothing.
 */

function currentPosition() {
  var λ = Object(_math__WEBPACK_IMPORTED_MODULE_3__["floorMod"])(new Date().getTimezoneOffset() / 4, 360); // 24 hours * 60 min / 4 === 360 degrees

  return [λ, 0];
}

function ensureNumber(num, fallback) {
  return underscore__WEBPACK_IMPORTED_MODULE_1__.isFinite(num) || num === Infinity || num === -Infinity ? num : fallback;
}
/**
 * @param bounds the projection bounds: [[x0, y0], [x1, y1]]
 * @param view the view bounds {width:, height:}
 * @returns {Object} the projection bounds clamped to the specified view.
 */


function clampedBounds(bounds, view) {
  var upperLeft = bounds[0];
  var lowerRight = bounds[1];
  var x = Math.max(Math.floor(ensureNumber(upperLeft[0], 0)), 0);
  var y = Math.max(Math.floor(ensureNumber(upperLeft[1], 0)), 0);
  var xMax = Math.min(Math.ceil(ensureNumber(lowerRight[0], view.width)), view.width - 1);
  var yMax = Math.min(Math.ceil(ensureNumber(lowerRight[1], view.height)), view.height - 1);
  return {
    x: x,
    y: y,
    xMax: xMax,
    yMax: yMax,
    width: xMax - x + 1,
    height: yMax - y + 1
  };
}

function fitProjection(proj, view) {
  var bounds = _d3__WEBPACK_IMPORTED_MODULE_2__["geoPath"]().projection(proj).bounds({
    type: "Sphere"
  });
  var hScale = (bounds[1][0] - bounds[0][0]) / proj.scale();
  var vScale = (bounds[1][1] - bounds[0][1]) / proj.scale();
  var fit = Math.min(view.width / hScale, view.height / vScale) * 0.9;
  var center = [view.width / 2, view.height / 2];
  return proj.scale(fit).translate(center);
}
/**
 * Returns a globe object with standard behavior. At least the newProjection method must be overridden to
 * be functional.
 */


function standardGlobe() {
  return {
    /**
     * This globe's current D3 projection.
     */
    projection: null,

    /**
     * @param view the size of the view as {width:, height:}.
     * @returns {Object} a new D3 projection of this globe appropriate for the specified view port.
     */
    newProjection: function newProjection(view) {
      throw new Error("method must be overridden");
    },

    /**
     * Hand-optimized projection if available, otherwise the normal d3 projection.
     */
    optimizedProjection: function optimizedProjection() {
      return this.projection;
    },

    /**
     * @param view the size of the view as {width:, height:}.
     * @returns {{x: Number, y: Number, xMax: Number, yMax: Number, width: Number, height: Number}}
     *          the bounds of the current projection clamped to the specified view.
     */
    bounds: function bounds(view) {
      return clampedBounds(_d3__WEBPACK_IMPORTED_MODULE_2__["geoPath"]().projection(this.projection).bounds({
        type: "Sphere"
      }), view);
    },

    /**
     * @param view the size of the view as {width:, height:}.
     * @returns {Number} the projection scale at which the entire globe fits within the specified view.
     */
    fit: function fit(view) {
      if (_micro__WEBPACK_IMPORTED_MODULE_4__["isEmbeddedInIFrame"]() && _micro__WEBPACK_IMPORTED_MODULE_4__["siteInstance"]() === "tara") {
        return 700; // HACK: to get things the right size in the iframe.
      }

      return this.newProjection(view).scale();
    },

    /**
     * @param view the size of the view as {width:, height:}.
     * @returns {Array} the projection transform at which the globe is centered within the specified view.
     */
    center: function center(view) {
      return [view.width / 2, view.height / 2];
    },

    /**
     * @returns {Array} the range at which this globe can be zoomed.
     */
    scaleExtent: function scaleExtent() {
      return [25, 3000];
    },

    /**
     * Returns the current orientation of this globe as a string. If the arguments are specified,
     * mutates this globe to match the specified orientation string, usually in the form "lat,lon,scale".
     *
     * @param [o] the orientation string
     * @param [view] the size of the view as {width:, height:}.
     */
    orientation: function orientation(o, view) {
      var projection = this.projection,
          rotate = projection.rotate();

      if (view) {
        var parts = underscore__WEBPACK_IMPORTED_MODULE_1__.isString(o) ? o.split(",") : [];
        var λ = +parts[0],
            φ = +parts[1],
            scale = +parts[2];
        var extent = this.scaleExtent();
        projection.rotate(underscore__WEBPACK_IMPORTED_MODULE_1__.isFinite(λ) && underscore__WEBPACK_IMPORTED_MODULE_1__.isFinite(φ) ? [-λ, -φ, rotate[2]] : this.newProjection(view).rotate());
        projection.scale(underscore__WEBPACK_IMPORTED_MODULE_1__.isFinite(scale) ? Object(_math__WEBPACK_IMPORTED_MODULE_3__["clamp"])(scale, extent[0], extent[1]) : this.fit(view));
        projection.translate(this.center(view));
        return this;
      }

      return [(-rotate[0]).toFixed(2), (-rotate[1]).toFixed(2), Math.round(projection.scale())].join(",");
    },

    /**
     * Returns an object that mutates this globe's current projection during a drag/zoom operation.
     * Each drag/zoom event invokes the move() method, and when the move is complete, the end() method
     * is invoked.
     *
     * @param startMouse starting mouse position.
     * @param startScale starting scale.
     */
    manipulator: function manipulator(startMouse, startScale) {
      var projection = this.projection;
      var sensitivity = 60 / startScale; // seems to provide a good drag scaling factor

      var rotation = [projection.rotate()[0] / sensitivity, -projection.rotate()[1] / sensitivity];
      var original = projection.precision();
      projection.precision(original * 10);
      return {
        move: function move(mouse, scale) {
          if (mouse) {
            var xd = mouse[0] - startMouse[0] + rotation[0];
            var yd = mouse[1] - startMouse[1] + rotation[1];
            projection.rotate([xd * sensitivity, -yd * sensitivity, projection.rotate()[2]]);
          }

          projection.scale(scale);
        },
        end: function end() {
          projection.precision(original);
        }
      };
    },

    /**
     * @returns {Array} the transform to apply, if any, to orient this globe to the specified coordinates.
     */
    locate: function locate(coord) {
      return null;
    },

    /**
     * Draws a polygon on the specified context of this globe's boundary.
     * @param context a Canvas element's 2d context.
     * @returns the context
     */
    defineMask: function defineMask(context) {
      _d3__WEBPACK_IMPORTED_MODULE_2__["geoPath"]().projection(this.projection).context(context)({
        type: "Sphere"
      });
      return context;
    },
    backgroundRenderer: function backgroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {
          context.fillStyle = "#303030";
          context.beginPath();
          path({
            type: "Sphere"
          });
          context.fill();
        }
      };
    },
    graticuleRenderer: function graticuleRenderer() {
      var graticuleMesh = _d3__WEBPACK_IMPORTED_MODULE_2__["geoGraticule"]()();
      var hemisphereMesh = _d3__WEBPACK_IMPORTED_MODULE_2__["geoGraticule"]().extentMinor([[0, 0], [0, 0]]).stepMajor([0, 90])();
      var graticule = _canvas_twod__WEBPACK_IMPORTED_MODULE_6__["makeStrokeRenderer"](graticuleMesh, {
        strokeStyle: "#505050",
        lineWidth: 1
      });
      var hemisphere = _canvas_twod__WEBPACK_IMPORTED_MODULE_6__["makeStrokeRenderer"](hemisphereMesh, {
        strokeStyle: "#808080",
        lineWidth: 1
      });
      return {
        renderTo: function renderTo(context, path) {
          graticule.renderTo(context, path);
          hemisphere.renderTo(context, path);
        }
      };
    },
    foregroundRenderer: function foregroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {
          context.strokeStyle = "#000005";
          context.lineWidth = 4;
          context.beginPath();
          path({
            type: "Sphere"
          });
          context.stroke();
        }
      };
    }
  };
}

function newGlobe(source, view) {
  var result = _micro__WEBPACK_IMPORTED_MODULE_4__["assign"](standardGlobe(), source);
  result.projection = result.newProjection(view);
  return result;
} // ============================================================================================


function atlantis(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoMollweide"]().rotate([30, -45, 90]).precision(0.1), view);
    }
  }, view);
}
function conic_equidistant(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoConicEquidistant"]().rotate(currentPosition()).precision(0.1), view);
    }
  }, view);
}
function equirectangular(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoEquirectangular"]().rotate(currentPosition()).precision(0.1), view);
    }
  }, view);
}
function orthographic(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoOrthographic"]().rotate(currentPosition()).precision(0.1).clipAngle(90), view);
    },
    optimizedProjection: function optimizedProjection() {
      return _projection_orthographic__WEBPACK_IMPORTED_MODULE_5__["default"].fromD3(this.projection);
    },
    backgroundRenderer: function backgroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {
          var proj = path.projection(),
              _proj$translate = proj.translate(),
              _proj$translate2 = _slicedToArray(_proj$translate, 2),
              x = _proj$translate2[0],
              y = _proj$translate2[1],
              scale = proj.scale();

          var gradient = context.createRadialGradient(x, y, 0, x, y, scale);
          gradient.addColorStop(0.69, "#303030");
          gradient.addColorStop(0.91, "#202020");
          gradient.addColorStop(0.96, "#000005");
          context.fillStyle = gradient;
          context.fillRect(x - scale, y - scale, scale * 2, scale * 2);
        }
      };
    },
    foregroundRenderer: function foregroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {
          var proj = path.projection(),
              _proj$translate3 = proj.translate(),
              _proj$translate4 = _slicedToArray(_proj$translate3, 2),
              x = _proj$translate4[0],
              y = _proj$translate4[1],
              scale = proj.scale();

          context.fillStyle = "#000005";
          context.beginPath();
          context.arc(x, y, scale - 2, 0, _consts__WEBPACK_IMPORTED_MODULE_0__["τ"], true);
          context.arc(x, y, scale + 4, 0, _consts__WEBPACK_IMPORTED_MODULE_0__["τ"], true);
          context.fill("evenodd");
        }
      };
    },
    locate: function locate(coord) {
      return [-coord[0], -coord[1], this.projection.rotate()[2]];
    }
  }, view);
}
function patterson(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoPatterson"]().precision(0.1), view);
    }
  }, view);
}
function stereographic(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoStereographic"]().rotate([-43, -20]).precision(1.0).clipAngle(180 - 0.0001).clipExtent([[0, 0], [view.width, view.height]]), view);
    },
    foregroundRenderer: function foregroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {// no foreground because always fullscreen
        }
      };
    }
  }, view);
}
function waterman(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoPolyhedralWaterman"]().rotate([20, 0]).precision(0.1), view);
    },
    foregroundRenderer: function foregroundRenderer() {
      return {
        renderTo: function renderTo(context, path) {
          var _context$canvas = context.canvas,
              width = _context$canvas.width,
              height = _context$canvas.height;
          context.fillStyle = context.strokeStyle = "#000005";
          context.lineWidth = 4;
          context.beginPath();
          path({
            type: "Sphere"
          });
          context.stroke();
          context.moveTo(0, 0);
          context.lineTo(width, 0);
          context.lineTo(width, height);
          context.lineTo(0, height);
          context.lineTo(0, 0);
          context.fill("evenodd");
        }
      };
    }
  }, view);
}
function winkel3(view) {
  return newGlobe({
    newProjection: function newProjection(view) {
      return fitProjection(_d3__WEBPACK_IMPORTED_MODULE_2__["geoWinkel3"]().precision(0.1), view);
    }
  }, view);
}