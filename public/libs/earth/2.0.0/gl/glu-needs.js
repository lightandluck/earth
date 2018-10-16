/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../log */ "./src/log.js");
/* harmony import */ var _plane_vert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./plane.vert */ "./src/gl/plane.vert");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * glu: webgl helpers
 *
 * Copyright (c) 2018 Cameron Beccario
 */




var log = Object(_log__WEBPACK_IMPORTED_MODULE_2__["default"])(); // see http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
//     http://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html

function throwOnErr(msg) {
  throw new Error(msg);
}

var GLU =
/*#__PURE__*/
function () {
  function GLU() {
    _classCallCheck(this, GLU);
  }

  _createClass(GLU, null, [{
    key: "getWebGL",

    /**
     * @param {HTMLCanvasElement} canvas DOM element
     * @param {Object} [attributes] WebGL context attributes
     * @returns {WebGLRenderingContext} the context or undefined if not supported.
     */
    value: function getWebGL(canvas, attributes) {
      var gl;

      try {
        gl = canvas.getContext("webgl", attributes);
      } catch (ignore) {}

      if (!gl) {
        try {
          gl = canvas.getContext("experimental-webgl", attributes);
        } catch (ignore) {}
      }

      return gl || undefined;
    }
    /** @returns {string} */

  }, {
    key: "planeVertexShader",
    value: function planeVertexShader() {
      return _plane_vert__WEBPACK_IMPORTED_MODULE_3__;
    }
  }, {
    key: "unitPlaneAttributes",
    value: function unitPlaneAttributes() {
      return {
        a_Position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        a_TexCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
      };
    }
    /**
     * @param {WebGLRenderingContext} gl
     * @param {Function} [ƒerr] ƒ(err) invoked when an error occurs (default is to throw).
     * @returns {GLUStick}
     */

  }, {
    key: "attach",
    value: function attach(gl) {
      var ƒerr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : throwOnErr;
      var defaultPixelStore = {
        PACK_ALIGNMENT: 1,
        UNPACK_ALIGNMENT: 1,
        UNPACK_FLIP_Y_WEBGL: false,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: false,
        UNPACK_COLORSPACE_CONVERSION_WEBGL: gl.BROWSER_DEFAULT_WEBGL
      };
      var defaultPixelStoreKeys = Object.keys(defaultPixelStore);
      var defaultTexParams = {
        TEXTURE_MIN_FILTER: gl.NEAREST,
        TEXTURE_MAG_FILTER: gl.NEAREST,
        TEXTURE_WRAP_S: gl.CLAMP_TO_EDGE,
        TEXTURE_WRAP_T: gl.CLAMP_TO_EDGE
      };
      var defaultTexParamKeys = Object.keys(defaultTexParams);

      function check(tag) {
        var num = gl.getError();

        if (num) {
          ƒerr("".concat(num, ":").concat(tag));
        }
      }

      return new (
      /*#__PURE__*/
      function () {
        function GLUStick() {
          _classCallCheck(this, GLUStick);
        }

        _createClass(GLUStick, [{
          key: "makePlaneVertexShader",

          /** @returns {WebGLShader} */
          value: function makePlaneVertexShader() {
            return this.makeShader(gl.VERTEX_SHADER, _plane_vert__WEBPACK_IMPORTED_MODULE_3__);
          }
        }, {
          key: "unitPlaneAttributes",
          value: function unitPlaneAttributes() {
            return {
              a_Position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
              a_TexCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
            };
          }
          /**
           * @param {number} type either VERTEX_SHADER or FRAGMENT_SHADER.
           * @param {string} source shader source code.
           * @returns {WebGLShader} the shader object, or null if the shader could not be compiled.
           */

        }, {
          key: "makeShader",
          value: function makeShader(type, source) {
            var shader = gl.createShader(type);
            check("createShader:".concat(type));
            gl.shaderSource(shader, source);
            check("shaderSource:".concat(type));
            gl.compileShader(shader);
            check("compileShader:".concat(type));
            var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            check("getShaderParameter:".concat(type));

            if (!status) {
              var message = gl.getShaderInfoLog(shader);
              check("getShaderInfoLog:".concat(type));
              gl.deleteShader(shader);
              check("deleteShader:".concat(type));
              ƒerr(message);
              return null;
            }

            return shader;
          }
          /**
           * @param {WebGLShader[]} shaders the compiled shaders.
           * @returns {WebGLProgram} the program, or null if the program could not be linked.
           */

        }, {
          key: "makeProgram",
          value: function makeProgram(shaders) {
            var program = gl.createProgram();
            check("createProgram");
            shaders.forEach(function (shader) {
              gl.attachShader(program, shader);
              check("attachShader");
            });
            gl.linkProgram(program);
            check("linkProgram");
            var status = gl.getProgramParameter(program, gl.LINK_STATUS);
            check("getProgramParameter");

            if (!status) {
              var message = gl.getProgramInfoLog(program);
              check("getProgramInfoLog");
              gl.deleteProgram(program);
              check("deleteProgram");
              ƒerr(message);
              return null;
            }

            return program;
          }
          /**
           * @param {WebGLTexture} texture 2d texture
           * @returns {WebGLFramebuffer} the framebuffer, or null if the framebuffer is not complete.
           */

        }, {
          key: "makeFramebufferTexture2D",
          value: function makeFramebufferTexture2D(texture) {
            var framebuffer = gl.createFramebuffer();
            check("createFramebuffer");
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            check("bindFramebuffer");
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            check("framebufferTexture2D");
            var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            check("checkFramebufferStatus");

            if (status !== gl.FRAMEBUFFER_COMPLETE) {
              gl.deleteFramebuffer(framebuffer);
              check("deleteFramebuffer");
              callback("framebuffer: " + status);
              return null;
            }

            return framebuffer;
          }
          /**
           * @param {WebGLProgram} program
           * @param {Object} textures map from name to texture entry
           * @returns {GLUUniforms}
           */

        }, {
          key: "uniforms",
          value: function uniforms(program, textures) {
            var _decls = {};
            var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            check("getProgramParameter");

            underscore__WEBPACK_IMPORTED_MODULE_0__.range(count).map(function (i) {
              var x = gl.getActiveUniform(program, i);
              check("getActiveUniform:".concat(i));
              return x;
            }).filter(function (e) {
              return !!e;
            }).forEach(function (e) {
              var location = gl.getUniformLocation(program, e.name);
              check("getUniformLocation:".concat(e.name));
              _decls[e.name] = {
                name: e.name,
                type: e.type,
                size: e.size,
                location: location
              };
            });

            function assign(name, v) {
              var decl = _decls[name] || {},
                  loc = decl.location; // log.debug(`uniform ${name}: ${v}`);

              switch (decl.type) {
                case gl.FLOAT:
                  return _micro__WEBPACK_IMPORTED_MODULE_1__["isArrayLike"](v) ? gl.uniform1fv(loc, v) : gl.uniform1f(loc, v);

                case gl.FLOAT_VEC2:
                  return gl.uniform2fv(loc, v);

                case gl.FLOAT_VEC3:
                  return gl.uniform3fv(loc, v);

                case gl.FLOAT_VEC4:
                  return gl.uniform4fv(loc, v);

                case gl.INT:
                  return _micro__WEBPACK_IMPORTED_MODULE_1__["isArrayLike"](v) ? gl.uniform1iv(loc, v) : gl.uniform1i(loc, v);

                case gl.INT_VEC2:
                  return gl.uniform2iv(loc, v);

                case gl.INT_VEC3:
                  return gl.uniform3iv(loc, v);

                case gl.INT_VEC4:
                  return gl.uniform4iv(loc, v);

                case gl.SAMPLER_2D:
                  {
                    var entry = textures[v];

                    if (!entry) {
                      log.warn("uniform '".concat(name, "' refers to unknown texture '").concat(v, "'"));
                      return;
                    }

                    gl.uniform1i(loc, entry.unit);
                    return;
                  }

                default:
                  log.warn("uniform '".concat(name, "' has unsupported type: ").concat(JSON.stringify(decl)));
              }
            }

            return new (
            /*#__PURE__*/
            function () {
              function GLUUniforms() {
                _classCallCheck(this, GLUUniforms);
              }

              _createClass(GLUUniforms, [{
                key: "decls",
                value: function decls() {
                  return _decls;
                }
                /**
                 * @param values an object {name: value, ...} where value is a number, array, or an object
                 *        {unit: i, texture: t} for binding a texture to a unit and sampler2D.
                 * @returns {GLUUniforms} this
                 */

              }, {
                key: "set",
                value: function set(values) {
                  Object.keys(values).forEach(function (name) {
                    assign(name, values[name]);
                    check("assign-uniform:".concat(name));
                  });
                  return this;
                }
              }]);

              return GLUUniforms;
            }())();
          }
          /**
           * @param {WebGLProgram} program
           * @returns {GLUAttribs}
           */

        }, {
          key: "attribs",
          value: function attribs(program) {
            var _decls2 = {};
            var count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            check("getProgramParameter");

            underscore__WEBPACK_IMPORTED_MODULE_0__.range(count).map(function (i) {
              var x = gl.getActiveAttrib(program, i);
              check("getActiveAttrib:".concat(i));
              return x;
            }).filter(function (e) {
              return !!e;
            }).forEach(function (e) {
              var location = gl.getAttribLocation(program, e.name);
              check("getAttribLocation:".concat(e.name));
              _decls2[e.name] = {
                name: e.name,
                type: e.type,
                size: e.size,
                location: location
              };
            });

            function assign(name, data) {
              var decl = _decls2[name] || {},
                  loc = decl.location;

              switch (decl.type) {
                case gl.FLOAT_VEC2:
                  var buffer = gl.createBuffer();
                  check("createBuffer:".concat(name));
                  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                  check("bindBuffer:".concat(name));
                  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                  check("bufferData:".concat(name));
                  gl.enableVertexAttribArray(loc);
                  check("enableVertexAttribArray:".concat(name));
                  return gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

                default:
                  log.warn("attribute '".concat(name, "' has unsupported type: ").concat(JSON.stringify(decl)));
              }
            }

            return new (
            /*#__PURE__*/
            function () {
              function GLUAttribs() {
                _classCallCheck(this, GLUAttribs);
              }

              _createClass(GLUAttribs, [{
                key: "decls",
                value: function decls() {
                  return _decls2;
                }
                /**
                 * @param values an object {name: value, ...} where value is an array.
                 * @returns {GLUAttribs} this
                 */

              }, {
                key: "set",
                value: function set(values) {
                  Object.keys(values).forEach(function (name) {
                    assign(name, values[name]);
                    check("assign-attrib:".concat(name));
                  });
                  return this;
                }
              }]);

              return GLUAttribs;
            }())();
          }
          /**
           * @param {Object} def texture definition
           * @returns {WebGLTexture}
           */

        }, {
          key: "makeTexture2D",
          value: function makeTexture2D(def) {
            var texture = gl.createTexture();
            check("createTexture");
            gl.activeTexture(gl.TEXTURE0);
            check("activeTexture");
            gl.bindTexture(gl.TEXTURE_2D, texture);
            check("bindTexture");
            var opt = _micro__WEBPACK_IMPORTED_MODULE_1__["assign"]({}, defaultPixelStore, defaultTexParams, def);
            var format = opt.format,
                type = opt.type,
                width = opt.width,
                height = opt.height,
                data = opt.data;
            defaultPixelStoreKeys.forEach(function (key) {
              gl.pixelStorei(gl[key], opt[key]);
              check("pixelStorei:".concat(key));
            });
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
            check("texImage2D");
            defaultTexParamKeys.forEach(function (key) {
              gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key]);
              check("texParameteri:".concat(key));
            });
            gl.bindTexture(gl.TEXTURE_2D, null);
            check("bindTexture");
            return texture;
          }
          /**
           * @param {WebGLTexture} texture
           * @param {Object} def texture definition
           */

        }, {
          key: "updateTexture2D",
          value: function updateTexture2D(texture, def) {
            gl.activeTexture(gl.TEXTURE0);
            check("activeTexture");
            gl.bindTexture(gl.TEXTURE_2D, texture);
            check("bindTexture");
            var opt = _micro__WEBPACK_IMPORTED_MODULE_1__["assign"]({}, defaultPixelStore, defaultTexParams, def);
            var format = opt.format,
                type = opt.type,
                width = opt.width,
                height = opt.height,
                data = opt.data;
            defaultPixelStoreKeys.forEach(function (key) {
              gl.pixelStorei(gl[key], opt[key]);
              check("pixelStorei:".concat(key));
            });
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, format, type, data);
            check("texSubImage2D");
            defaultTexParamKeys.forEach(function (key) {
              gl.texParameteri(gl.TEXTURE_2D, gl[key], opt[key]);
              check("texParameteri:".concat(key));
            });
            gl.bindTexture(gl.TEXTURE_2D, null);
            check("bindTexture");
            return texture;
          }
          /**
           * @param {WebGLTexture} texture
           * @param {Object} def texture definition
           * @param {Object} existing texture entry
           * @returns {boolean} true if a difference between def and existing was found and applied
           */

        }, {
          key: "updateTexture2DParams",
          value: function updateTexture2DParams(texture, def, existing) {
            var changed = false;

            for (var i = 0; i < defaultTexParamKeys.length; i++) {
              var key = defaultTexParamKeys[i];
              var defaultValue = defaultTexParams[key];
              var newValue = def[key] || defaultValue;
              var oldValue = existing[key] || defaultValue;

              if (newValue !== oldValue) {
                if (!changed) {
                  changed = true;
                  gl.activeTexture(gl.TEXTURE0);
                  check("activeTexture");
                  gl.bindTexture(gl.TEXTURE_2D, texture);
                  check("bindTexture");
                }

                gl.texParameteri(gl.TEXTURE_2D, gl[key], newValue);
                check("texParameteri:".concat(key));
              }
            }

            if (changed) {
              gl.bindTexture(gl.TEXTURE_2D, null);
              check("bindTexture");
            }

            return changed;
          }
        }, {
          key: "context",

          /** @returns {WebGLRenderingContext} */
          get: function get() {
            return gl;
          }
        }]);

        return GLUStick;
      }())();
    }
  }]);

  return GLU;
}();