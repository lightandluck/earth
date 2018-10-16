/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");
/* harmony import */ var _glu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./glu */ "./src/gl/glu.mjs");
/* harmony import */ var _canvas_twod__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../canvas/twod */ "./src/canvas/twod.mjs");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var _header_frag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./header.frag */ "./src/gl/header.frag");
/* harmony import */ var _main_frag__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./main.frag */ "./src/gl/main.frag");






/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} [intermediateCanvas]
 * @param ƒalpha ƒ() => number, in the range [0, 1] inclusive. The alpha to apply to the whole frame.
 * @param ƒdisplay ƒ() => {width: number, height: number, pixelRatio: number}. Function that returns the current
 *                 canvas's display size and desired pixel ratio. For example, a ratio of 2.0 would make the drawing
 *                 buffer twice the size in each dimension as the display size (and thus 4x the pixel count),
 *                 whereas a ratio of 0.5 halves the size.
 * @param ƒcomponents ƒ({GLUStick}) => array of "webgl" components/renderers, or empty array if the frame cannot or
 *                    should not be drawn.
 * @returns {*}
 */

/* harmony default export */ __webpack_exports__["default"] = (function (canvas, intermediateCanvas, ƒalpha, ƒdisplay, ƒcomponents) {
  // Draw webgl offscreen then copy to 2d canvas. Reduces jank, especially on iOS, during compositing of different
  // layers at the expense of some performance. Better way?
  var useIntermediateCanvas = intermediateCanvas !== undefined;
  var container = useIntermediateCanvas ? intermediateCanvas : canvas;
  var targetCtx = useIntermediateCanvas ? canvas.getContext("2d") : undefined;
  var gl = _glu__WEBPACK_IMPORTED_MODULE_1__["default"].getWebGL(container);
  var glu = _glu__WEBPACK_IMPORTED_MODULE_1__["default"].attach(gl);
  gl.getExtension("OES_texture_float");
  gl.getExtension("OES_texture_float_linear");
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  var vertexShader = glu.makeShader(gl.VERTEX_SHADER, _glu__WEBPACK_IMPORTED_MODULE_1__["default"].planeVertexShader());
  var textures = {}; // registry of textures used by webgl components, by name

  var units = underscore__WEBPACK_IMPORTED_MODULE_0__.range(8).map(function () {
    return null;
  }); // a[i] -> texture, where i is unit index. webgl 1.0 guarantees 8 units


  var currentUnit = 1; // next available texture unit

  var currentSources = []; // sources of current program

  var currentProgram = null; // program to run

  var currentUniforms = null; // uniform assigner

  var currentWidth = -1; // viewport width

  var currentHeight = -1; // viewport height

  /**
   * Compiles new shaders and sets up unit plane.
   * @param {string[]} newSources
   */

  function buildProgram(newSources) {
    var fragmentShaderSource = _header_frag__WEBPACK_IMPORTED_MODULE_4__ + newSources.join("") + _main_frag__WEBPACK_IMPORTED_MODULE_5__;
    var fragmentShader = glu.makeShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    var newProgram = glu.makeProgram([vertexShader, fragmentShader]);
    glu.attribs(newProgram).set(_glu__WEBPACK_IMPORTED_MODULE_1__["default"].unitPlaneAttributes());
    currentSources = newSources;
    currentProgram = newProgram;
    currentUniforms = glu.uniforms(newProgram, textures);
    gl.useProgram(newProgram);
  }
  /**
   * Applies delta between existing texture settings and new settings.
   * @param def texture definition as specified in GLU
   * @param entry existing texture entry object: {def: {}, texture: WebGLTexture, unit: number}
   * @returns {Object} texture entry object, with reference to "data" removed to allow garbage collection.
   */


  function apply(def, entry) {
    if (entry) {
      // texture entry exists, so let's find what's different
      var existing = entry.def;

      if (def.hash === existing.hash) {
        // same data
        if (!glu.updateTexture2DParams(entry.texture, def, existing)) {
          return entry; // nothing to do because nothing is different
        }

        return {
          def: underscore__WEBPACK_IMPORTED_MODULE_0__.omit(def, "data"),
          texture: entry.texture
        };
      } // pixels are different


      if (def.width === existing.width && def.height === existing.height && def.format === existing.format && def.type === existing.type) {
        // but data is the same shape, so can reuse this texture
        glu.updateTexture2D(entry.texture, def);
        return {
          def: underscore__WEBPACK_IMPORTED_MODULE_0__.omit(def, "data"),
          texture: entry.texture
        };
      } // replace texture with a new one


      gl.deleteTexture(entry.texture);
    } // create new texture


    var texture = glu.makeTexture2D(def);
    return {
      def: underscore__WEBPACK_IMPORTED_MODULE_0__.omit(def, "data"),
      texture: texture
    };
  }
  /**
   * @param {Object} defs creates or updates texture entries for each specified texture definition
   * @returns {Object[]} the texture entries
   */


  function registerTextures(defs) {
    return Object.keys(defs).map(function (name) {
      return textures[name] = apply(defs[name], textures[name]);
    });
  }
  /**
   * Sequentially assigns and binds textures to texture units.
   * @param {Object[]} entries the texture entries to bind.
   */


  function bindTextures(entries) {
    entries.forEach(function (entry) {
      var texture = entry.texture; // check if already bound to the current unit

      if (units[currentUnit] !== texture) {
        units[currentUnit] = texture;
        gl.activeTexture(gl.TEXTURE0 + currentUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      }

      entry.unit = currentUnit++;
    });
  }
  /**
   * Adjust size of drawing buffer (i.e., viewport) to match display.
   * @param {{width: number, height: number, pixelRatio: number}} display the attributes of the display.
   */


  function resizeTo(display) {
    var newWidth = Math.round(display.width * display.pixelRatio);
    var newHeight = Math.round(display.height * display.pixelRatio);

    if (newWidth !== currentWidth || newHeight !== currentHeight) {
      canvas.width = container.width = newWidth;
      canvas.height = container.height = newHeight;
      gl.viewport(0, 0, newWidth, newHeight);
      currentWidth = newWidth;
      currentHeight = newHeight;
    }
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (targetCtx) {
      _canvas_twod__WEBPACK_IMPORTED_MODULE_2__["clearContext"](targetCtx);
    }
  }

  function check(tag) {
    var err = gl.getError();

    if (err !== 0) {
      throw new Error("".concat(err, ":").concat(tag));
    }
  }
  /**
   * Render a frame.
   *
   * @returns {boolean} true if current components support webgl, otherwise false (to then be handled by 2d).
   */


  function _draw() {
    var display = ƒdisplay();
    resizeTo(display);
    check("fast_resize");
    clear();
    check("fast_clear");
    var components = ƒcomponents(glu);

    if (components.length === 0) {
      // Either we aren't supposed to draw anything or some of the components do not support webgl.
      return false;
    } // Check if we should change the program.


    var newSources = underscore__WEBPACK_IMPORTED_MODULE_0__.flatten(components.map(function (c) {
      return c.shaderSource();
    }));

    if (!_micro__WEBPACK_IMPORTED_MODULE_3__["arraysEq"](currentSources, newSources)) {
      buildProgram(newSources);
    }

    check("fast_program"); // Bind textures needed for this frame to available units. Just sequentially assign from 1.

    currentUnit = 1;
    components.forEach(function (c) {
      return bindTextures(registerTextures(c.textures()));
    });

    while (currentUnit < units.length) {
      units[currentUnit++] = null; // clear out unused units to release their texture objects.
    }

    check("fast_textures"); // Ask each component to assign uniforms.

    components.forEach(function (c) {
      return currentUniforms.set(c.uniforms());
    });
    currentUniforms.set({
      u_Detail: display.pixelRatio,
      // HACK: set alpha based on current state of animating particles.
      //       should this instead by handled by the palette component?
      u_Alpha: ƒalpha()
    });
    check("fast_uniforms");
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    check("fast_draw");

    if (useIntermediateCanvas) {
      targetCtx.drawImage(container, 0, 0);
    }

    return true;
  }

  return {
    /**
     * Render a frame.
     *
     * @returns {{pass: boolean}} result object where pass: true means the draw succeeded and pass: false means
     *          the draw did not succeed (likely because components do not yet support webgl). An "err" attribute
     *          is present if the draw was attempted but failed.
     */
    draw: function draw() {
      try {
        var pass = _draw();

        check("fast_done");
        return {
          pass: pass
        };
      } catch (e) {
        return {
          pass: false,
          err: e.toString()
        };
      }
    }
  };
});