function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/**
 * @param {number} a
 * @param {number} n
 * @returns {number} remainder of floored division, i.e., floor(a / n). Useful for consistent modulo of negative
 *          numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
 */

function floorMod(a, n) {
  var f = a - n * Math.floor(a / n); // hack: when a is within an ulp of n, f can be equal to n (because the subtraction has no effect). But the
  // result should be in the range [0, n), so check for this case. Example: floorMod(-1e-16, 10)

  return f === n ? 0 : f;
}
/**
 * Round to closest whole number using banker's rounding. From Java's Math.rint method.
 * @param {number} v
 * @returns {number} the value rounded half even
 */

function rint(v) {
  var x = Math.abs(v);

  if (x < TWOP52) {
    x += TWOP52;
    x -= TWOP52;
  }

  return Math.sign(v) * x;
}
var TWOP52 = Math.pow(2, 52);
/**
 * Round to the closest multiple using banker's rounding.
 * @param {number} v
 * @param {number} m the multiple
 * @returns {number} the value rounded to the nearest increment of m.
 */

function rintToMultiple(v, m) {
  return rint(v / m) * m;
}
/**
 * @param {number} x
 * @param {number} low
 * @param {number} high
 * @returns {number} the value x clamped to the range [low, high].
 */

function clamp(x, low, high) {
  return Math.max(low, Math.min(x, high));
}
/**
 * @param {number} x
 * @param {number} low the range lower bound, inclusive
 * @param {number} high the range higher bound, inclusive
 * @returns {number} the value x rescaled, but not clamped, to the unit scale (the range [0, 1] inclusive).
 */

function proportion(x, low, high) {
  return (x - low) / (high - low);
}
/**
 * @param {number} p a value on the unit scale
 * @param {number} low the range lower bound, inclusive
 * @param {number} high the range higher bound, inclusive
 * @returns {number} the unit scale value p rescaled, but not clamped, to the range [low, high] inclusive
 */

function spread(p, low, high) {
  return p * (high - low) + low;
}
/**
 * @param {number[]} vec [x, y]
 * @returns {number} euclidean length of the 2-d vector
 */

function length(vec) {
  var _vec = _slicedToArray(vec, 2),
      x = _vec[0],
      y = _vec[1];

  return Math.sqrt(x * x + y * y);
}
/**
 * @param {number[]} a [ax, ay]
 * @param {number[]} b [bx, by]
 * @returns {number} euclidean distance between two 2-d points
 */

function distance(a, b) {
  return length([b[0] - a[0], b[1] - a[1]]);
}
/**
 * @param {number[]} vec [x, y]
 * @returns {number} the direction of the 2-d vector on the compass rose in degrees in the range [0, 360).
 */

function toCardinalDegrees(vec) {
  var deg = Math.atan2(vec[0], vec[1]) * DEG;
  return (deg + 360) % 360; // map (-180, 180] to [0, 360)
}