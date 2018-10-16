/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var _texture2D_frag__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture2D.frag */ "./src/interpolate/texture2D.frag");
/* harmony import */ var _bilinearWrap_frag__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bilinearWrap.frag */ "./src/interpolate/bilinearWrap.frag");
/* harmony import */ var _scalar_frag__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scalar.frag */ "./src/interpolate/scalar.frag");
/* harmony import */ var _vector_frag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vector.frag */ "./src/interpolate/vector.frag");





/**
 *
 * @param {GLUStick} glu
 * @param dims
 * @returns {*}
 */

function lookup(glu, dims) {
  var gl = glu.context;
  var width = dims.width,
      height = dims.height;
  return {
    shaderSourceTexture2D: function shaderSourceTexture2D() {
      return _texture2D_frag__WEBPACK_IMPORTED_MODULE_1__;
    },
    shaderSourceBilinearWrap: function shaderSourceBilinearWrap() {
      return _bilinearWrap_frag__WEBPACK_IMPORTED_MODULE_2__;
    },
    scalarSource: function scalarSource() {
      return _scalar_frag__WEBPACK_IMPORTED_MODULE_3__;
    },
    vectorSource: function vectorSource() {
      return _vector_frag__WEBPACK_IMPORTED_MODULE_4__;
    },
    scalarTexture: function scalarTexture(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _micro__WEBPACK_IMPORTED_MODULE_0__["assign"]({
        format: gl.LUMINANCE,
        type: gl.FLOAT,
        width: width,
        height: height,
        data: data
      }, options);
    },
    vectorTexture: function vectorTexture(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _micro__WEBPACK_IMPORTED_MODULE_0__["assign"]({
        format: gl.LUMINANCE_ALPHA,
        type: gl.FLOAT,
        width: width,
        height: height,
        data: data
      }, options);
    }
  };
}