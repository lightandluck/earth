/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var _lookup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lookup */ "./src/interpolate/lookup.mjs");
/*
 * nearest: a nearest-neighbor interpolator for scalar and vector fields.
 */


/**
 * @param grid a grid that supports the "closest" function.
 * @param {Float32Array} data backing data, the same length as the grid.
 * @returns {Function} a nearest neighbor interpolation function f([λ, φ]) -> v
 */

function scalar(grid, data) {
  var hash = _micro__WEBPACK_IMPORTED_MODULE_0__["arrayHashCode"](data, 1000);
  /**
   * @param {number[]} coord [λ, φ] in degrees.
   * @returns {number} the nearest neighbor value or 7e37 if none.
   */

  function nearest(coord) {
    var i = grid.closest(coord);
    return i === i ? data[i] : 7e37;
  }
  /**
   * @param {GLUStick} glu
   */


  nearest.webgl = function (glu) {
    var gl = glu.context;
    var look = Object(_lookup__WEBPACK_IMPORTED_MODULE_1__["lookup"])(glu, grid.dimensions());
    return {
      shaderSource: function shaderSource() {
        return [look.scalarSource(), look.shaderSourceTexture2D()];
      },
      textures: function textures() {
        return {
          weather_data: look.scalarTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: gl.NEAREST,
            TEXTURE_MAG_FILTER: gl.NEAREST
          })
        };
      },
      uniforms: function uniforms() {
        return {
          u_Data: "weather_data"
        };
      }
    };
  };

  return nearest;
}
/**
 * @param grid a grid that supports the "closest" function.
 * @param {Float32Array|number[]} data backing data in [u0, v0, u1, v1, ...] layout, double the grid size.
 * @returns {Function} a nearest neighbor interpolation function f([λ, φ]) -> [u, v, m]
 */

function vector(grid, data) {
  var hash = _micro__WEBPACK_IMPORTED_MODULE_0__["arrayHashCode"](data, 1000);
  /**
   * @param {number[]} coord [λ, φ] in degrees.
   * @returns {number[]} the nearest neighbor value as a vector [u, v, m] or [7e37, 7e37, 7e37] if none.
   */

  function nearest(coord) {
    var j = grid.closest(coord) * 2;

    if (j === j) {
      var u = data[j],
          v = data[j + 1];

      if (u < 7e37 && v < 7e37) {
        return [u, v, Math.sqrt(u * u + v * v)];
      }
    }

    return [7e37, 7e37, 7e37];
  }
  /**
   * @param {GLUStick} glu
   */


  nearest.webgl = function (glu) {
    var gl = glu.context;
    var look = Object(_lookup__WEBPACK_IMPORTED_MODULE_1__["lookup"])(glu, grid.dimensions());
    return {
      shaderSource: function shaderSource() {
        return [look.vectorSource(), look.shaderSourceTexture2D()];
      },
      textures: function textures() {
        return {
          weather_data: look.vectorTexture(data, {
            hash: hash,
            TEXTURE_MIN_FILTER: gl.NEAREST,
            TEXTURE_MAG_FILTER: gl.NEAREST
          })
        };
      },
      uniforms: function uniforms() {
        return {
          u_Data: "weather_data"
        };
      }
    };
  };

  return nearest;
}