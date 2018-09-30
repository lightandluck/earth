/**
 * micro - a grab bag of somewhat useful utility functions and other stuff that requires unit testing
 *
 * Copyright (c) 2018 Cameron Beccario
 *
 * For a free version of this project, see https://github.com/cambecc/earth
 */

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isDevMode() {
  return +window.location.port === 8081;
}
function siteLangCode() {
  return d3.select("html").attr("lang") || "en";
}
function siteInstance() {
  // UNDONE: this may no longer be needed because Cloudflare responds with "consty: Origin" CORS header set.
  var match = window.location.hostname.match(/(.*)\.nullschool\.net$/) || [],
      name = match[1] || "earth";
  return name === "earth" ? "" : name;
}
/**
 * @returns {boolean} true if the specified value is truthy.
 */

function isTruthy(x) {
  return !!x;
}
/**
 * @returns {boolean} true if the specified value is not null and not undefined.
 */

function isValue(x) {
  return x !== null && x !== undefined;
}
/**
 * @returns the first argument if not null and not undefined, otherwise the second argument.
 */

function coalesce(a, b) {
  return isValue(a) ? a : b;
}
/**
 * Converts the argument to a number, including special cases for fractions:
 *     0.25  -> 0.25
 *     "1/4" -> 0.25
 *     [1,4] -> 0.25
 *     ".25" -> 0.25
 *
 * @param x any object. When an array, then interpreted as the fraction: a[0] / a[1]. When a string containing
 *        a slash, the value is first converted to an array by splitting on "/".
 * @returns {number} the specified argument converted to a number.
 */

function decimalize(x) {
  if (_.isString(x) && x.indexOf("/") >= 0) {
    x = x.split("/");
  }

  return isArrayLike(x) && x.length === 2 ? x[0] / x[1] : +x;
}
/**
 * @param {Array|*} x the value to convert to a scalar.
 * @returns {*} the magnitude if x is a vector (i.e., x[2]), otherwise x itself.
 */

function scalarize(x) {
  return isArrayLike(x) ? x[2] : x;
}
/**
 * @returns {string} the specified string with the first letter capitalized.
 */

function capitalize(s) {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.substr(1);
}
/**
 * @returns {boolean} true if agent is probably firefox. Don't really care if this is accurate.
 */

function isFF() {
  return /firefox/i.test(navigator.userAgent);
}
/***
 * @returns {boolean} true if agent is probably iOS. Don't really care if this is accurate.
 */

function isIOS() {
  return /ipad|iphone|ipod/i.test(navigator.userAgent);
}
/**
 * @returns {boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
 */

function isMobile() {
  return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent);
}
function isEmbeddedInIFrame() {
  return self !== top;
}
/**
 * Finds the method having the specified name on the object thisArg, and returns it as a function bound
 * to thisArg. If no method can be found, or thisArg is not a value, then returns null.
 *
 * @param thisArg the object
 * @param methodName the method name to bind to the object
 * @returns {Function} the method bound to the object, if it exists.
 */

function bindup(thisArg, methodName) {
  return isValue(thisArg) && thisArg[methodName] ? thisArg[methodName].bind(thisArg) : null;
}
/**
 * @returns {{width: number, height: number}} an object that describes the size of the browser's current view.
 */

function view() {
  var w = window;
  var d = document && document.documentElement;
  var b = document && document.getElementsByTagName("body")[0];
  var x = w.innerWidth || d.clientWidth || b.clientWidth;
  var y = w.innerHeight || d.clientHeight || b.clientHeight;
  return {
    width: Math.ceil(x),
    height: Math.ceil(y)
  };
}
/**
 * Removes all children of the specified DOM element.
 */

function removeChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
/**
 * @returns {*} a new mouse click event instance
 */

function newClickEvent() {
  try {
    return new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true
    });
  } catch (e) {
    // Chrome mobile supports only the old fashioned, deprecated way of constructing events. :(
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    return event;
  }
}
/**
 * @returns {Array} of wind colors and a method, indexFor, that maps wind magnitude to an index on the color scale.
 */

function windIntensityColorScale(step, maxWind) {
  var result = [];

  for (var j = 85; j <= 255; j += step) {
    result.push("rgb(".concat(j, ",").concat(j, ",").concat(j, ")"));
  }

  result.indexFor = function (m) {
    // map wind speed to a style
    return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
  };

  return result;
}
/**
 * Returns a human readable string for the provided coordinates.
 */

function formatCoordinates(λ, φ) {
  return Math.abs(φ).toFixed(2) + "° " + (φ >= 0 ? "N" : "S") + ", " + Math.abs(λ).toFixed(2) + "° " + (λ >= 0 ? "E" : "W");
}
/**
 * Returns a human readable string for the provided scalar in the given units.
 */

function formatScalar(value, units) {
  return units.conversion(value).toFixed(units.precision);
}
/**
 * Returns a human readable string for the provided vector in the given units. The vector has the parts [u, v].
 * See http://mst.nerc.ac.uk/wind_vect_convs.html.
 */

function formatVector(vec, units) {
  vec = units.convention === "into" ? [-vec[0], -vec[1]] : vec; // invert direction by convention, if necessary

  var deg = rintToMultiple(toCardinalDegrees(vec), 5); // round to nearest 5 degrees on the compass rose

  return "".concat(deg.toFixed(0), "\xB0 @ ").concat(formatScalar(length(vec), units));
}
/**
 * @param {string} resource
 * @param {Function} resolve
 * @param {Function} reject
 * @param {ProgressEvent} err
 * @param {*} result
 * @returns {*}
 */

function xhrResolver(resource, resolve, reject, err, result) {
  var _ref = err || {},
      target = _ref.target;

  return target ? target.status ? reject({
    status: target.status,
    message: target.statusText,
    resource: resource,
    error: err
  }) : reject({
    status: -1,
    message: "Cannot load ".concat(resource, ": ").concat(err),
    resource: resource,
    error: err
  }) : resolve(result);
}
/**
 * Returns a promise for a JSON resource (URL) fetched via XHR. If the load fails, the promise rejects with an
 * object describing the reason: {status: http-status-code, message: http-status-text, resource:}.
 * @returns {Promise}
 */


function loadJson(resource) {
  return new Promise(function (resolve, reject) {
    d3.json(resource, function (err, result) {
      return xhrResolver(resource, resolve, reject, err, result);
    });
  });
}
/**
 * Same as loadJson but returns a singleton promise for each URL.
 */

var loadJsonOnce = _.memoize(loadJson);
/**
 * Parses headers string into a map.
 *
 * "Content-Type: Foo\r\nContent-Length: 1234"  ->  {"content-type": ["foo"], "content-length": ["1234"]}
 *
 * @param {string} s unparsed headers string.
 * @returns {Object} map of header name to array of values (usually just one element, but possibly more).
 */

function parseHeaders(s) {
  var result = Object.create(null);
  (s || "").split("\n").forEach(function (line) {
    var i = line.indexOf(":");
    if (i < 0) return;
    var key = line.substr(0, i).trim().toLowerCase();
    var value = line.substr(i + 1).trim();
    result[key] = (result[key] || []).concat(value);
  });
  return result;
}
/**
 * @param {ProgressEvent} e
 * @returns {number}
 */


function computeProgress(e) {
  var total = e.total;

  if (!e.lengthComputable) {
    var headers = parseHeaders(e.target.getAllResponseHeaders());
    total = (headers["x-amz-meta-uncompressed-size"] || [])[0];
  }

  return total ? clamp(e.loaded / total, 0, 1) : NaN;
}
/**
 * Returns a promise for an EPAK resource (URL) fetched via XHR. If the load fails, the promise rejects
 * with an object describing the reason: {status: http-status-code, message: http-status-text, resource:}.
 * @returns {Promise}
 */


function loadEpak(resource) {
  return new Promise(function (resolve, reject) {
    d3.request(resource).responseType("arraybuffer").response(function (req) {
      return decodeEpak(req.response);
    }) // UNDONE: promise swallows decoding exceptions
    // .on("progress", /** @type {ProgressEvent} */ e => {
    //     const pct = computeProgress(e);
    //     if (pct) {
    //         console.log(resource, Math.round(pct * 100));
    //     } else {
    //         console.log(resource, e.loaded);
    //     }
    // })
    .get(function (err, res) {
      return xhrResolver(resource, resolve, reject, err, res);
    });
  });
}
/**
 * Returns the distortion introduced by the specified projection at the given point.
 *
 * This method uses finite difference estimates to calculate warping by adding a very small amount (h) to
 * both the longitude and latitude to create two lines. These lines are then projected to pixel space, where
 * they become diagonals of triangles that represent how much the projection warps longitude and latitude at
 * that location.
 *
 * <pre>
 *        (λ, φ+h)                  (xλ, yλ)
 *           .                         .
 *           |               ==>        \
 *           |                           \   __. (xφ, yφ)
 *    (λ, φ) .____. (λ+h, φ)       (x, y) .--
 * </pre>
 *
 * See:
 *     Map Projections: A Working Manual, Snyder, John P: pubs.er.usgs.gov/publication/pp1395
 *     gis.stackexchange.com/questions/5068/how-to-create-an-accurate-tissot-indicatrix
 *     www.jasondavies.com/maps/tissot
 *
 * @returns {Array} array of scaled derivatives [dx/dλ, dy/dλ, dx/dφ, dy/dφ]
 */

function distortion(projection, λ, φ, x, y) {
  var hλ = λ < 0 ? H : -H;
  var hφ = φ < 0 ? H : -H;
  var pλ = projection([λ + hλ, φ]);
  var pφ = projection([λ, φ + hφ]); // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1° λ
  // changes depending on φ. Without this, there is a pinching effect at the poles.

  var k = Math.cos(φ * RAD);
  var hλk = hλ * k;
  return [(pλ[0] - x) / hλk, // dx/dλ
  (pλ[1] - y) / hλk, // dy/dλ
  (pφ[0] - x) / hφ, // dx/dφ
  (pφ[1] - y) / hφ // dy/dφ
  ];
}
var H = 0.0000360; // 0.0000360°φ ~= 4m

/**
 * @param query URL search query string, e.g., "?a=1&b=2&c=&d"
 * @returns {Object} an object of terms, e.g., {a: "1", b: "2", c: "", d: null}
 */

function parseQueryString(query) {
  return _.object(query.split(/[?&]/).filter(isTruthy).map(function (term) {
    return term.split("=").map(decodeURIComponent).concat([null]); // use null for 2nd element when undefined
  }));
}
function dateToConfig(date) {
  return {
    date: normalize(date)
  };
}
function isAppMode() {
  return _.has(parseQueryString(window.location.search), "app");
}
function isKioskMode() {
  var host = document.referrer.split("/")[2] || "";
  var override = /dailymail/i.test(host);
  return _.has(parseQueryString(window.location.search), "kiosk") && !override;
}
/** @returns {boolean} true if globe rotation and zoom should be disabled. UNDONE: no one uses this. rip out? */

function isFixedMode() {
  return _.has(parseQueryString(window.location.search), "fixed");
}
function isDebugMode() {
  return _.has(parseQueryString(window.location.search), "debug");
}
/**
 * @param {Array|Uint8Array|Float32Array} a any array-like object
 * @param {Array|Uint8Array|Float32Array} b any array-like object
 * @returns {boolean} true if both arrays are strictly equal (using ===) while recursing down nested arrays.
 */

function arraysEq(a, b) {
  for (var i = 0; i < a.length; i++) {
    var s = a[i],
        t = b[i];

    if (s === t) {
      continue; // exactly equal
    }

    if (s !== s && t !== t) {
      continue; // both are NaN
    }

    if (isArrayLike(s) && arraysEq(s, t)) {
      continue; // nested arrays are equal
    }

    return false;
  }

  return a.length === b.length;
}
/**
 * @param {Float32Array} a [a0, a1, a2, ...]
 * @param {Float32Array} b [b0, b1, b2, ...]
 * @returns {Float32Array} [a0, b0, a1, b1, a2, b2, ...]
 */

function merge(a, b) {
  var result = new Float32Array(a.length * 2);

  for (var i = 0; i < a.length; i++) {
    var j = i * 2;
    result[j] = a[i];
    result[j + 1] = b[i];
  }

  return result;
}
/**
 * @param {*|Uint8Array} src any array-like object
 * @returns {Array} a new Array containing the same elements.
 */

function toArray(src) {
  return Array.prototype.slice.call(src); // Replace with Array.from() in the future.
}
/**
 * @param {Int8Array|Int16Array|Int32Array} array any TypedArray
 * @param {Number} samples the number of samples to compute the hash code
 * @returns {Number} the hash code
 */

function _arrayHashCode(array, samples) {
  var result = new Int32Array([array.byteLength]);
  var step = Math.max(array.length / samples, 1);

  for (var i = 0; i < array.length; i += step) {
    result[0] = 31 * result[0] + array[Math.floor(i)];
  }

  return result[0];
}
/**
 * Constructs a hash code from _some_ elements of an array. Trades collision avoidance for performance.
 * @param {Float32Array|Uint8Array} array any TypedArray
 * @param {Number} [samples] the number of samples to compute the hash code with. (default: all)
 * @returns {Number} the hash code
 */


function arrayHashCode(array) {
  var samples = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
  var data;

  switch (array.byteLength % 4) {
    case 0:
      data = new Int32Array(array.buffer);
      break;

    case 2:
      data = new Int16Array(array.buffer);
      break;

    default:
      data = new Int8Array(array.buffer);
      break;
  }

  return _arrayHashCode(data, samples);
}
function isArrayLike(obj) {
  if (Array.isArray(obj)) return true;
  if (_typeof(obj) !== "object" || !obj) return false;
  var length = obj.length;
  return typeof length === "number" && length >= 0;
}
function omit(obj) {
  for (var _len = arguments.length, discard = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    discard[_key - 1] = arguments[_key];
  }

  var result = {};
  Object.keys(obj).forEach(function (key) {
    if (discard.indexOf(key) < 0) {
      result[key] = obj[key];
    }
  });
  return result;
}
var hasOwnProperty = Object.prototype.hasOwnProperty;

function _assign(target, source) {
  // UNDONE: replace with Object.assign when IE11 no longer supported.
  if (source !== undefined && source !== null) {
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
}
/**
 * @param {Object} target the destination object.
 * @param {...Object} [sources] the source objects.
 * @returns {Object} Returns `target`.
 */


function assign(target, sources) {
  for (var i = 1; i < arguments.length; i++) {
    _assign(target, arguments[i]);
  }

  return target;
}
/**
 * @param {...Object} [sources] the source objects.
 * @returns {Object} returns a new object, with no prototype, containing properties from the sources.
 */

function ø(sources) {
  var result = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    _assign(result, arguments[i]);
  }

  return result;
}

function _flatten(array, target) {
  for (var i = 0; i < array.length; i++) {
    var e = array[i];

    if (isArrayLike(e)) {
      _flatten(e, target);
    } else {
      target.push(e);
    }
  }

  return target;
}

function flatten(array) {
  return isArrayLike(array) ? _flatten(array, []) : undefined;
}