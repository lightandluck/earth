/**
 * decoder - methods for decoding weather data
 *
 * Copyright (c) 2018 Cameron Beccario
 */

/**
 * Decodes a UTF8 string from an array of bytes.
 *
 * @param {Uint8Array} bytes an array of bytes
 * @returns {String} the decoded String
 */

function decodeUTF8(bytes) {
  var charCodes = [];

  for (var i = 0; i < bytes.length;) {
    var b = bytes[i++];

    switch (b >> 4) {
      case 0xc:
      case 0xd:
        b = (b & 0x1f) << 6 | bytes[i++] & 0x3f;
        break;

      case 0xe:
        b = (b & 0x0f) << 12 | (bytes[i++] & 0x3f) << 6 | bytes[i++] & 0x3f;
        break;

      default: // use value as-is

    }

    charCodes.push(b);
  }

  return String.fromCharCode.apply(null, charCodes);
}
/*
function blockView(data, cols, rows) {
    const area = cols * rows;
    return {
        x: function(i) {
            return i % cols;
        },
        y: function(i) {
            return Math.floor(i / cols) % rows;
        },
        z: function(i) {
            return Math.floor(i / area);
        },
        valueAt: function(x, y, z) {
            if (0 <= x && x < cols) {
                if (0 <= y && y < rows) {
                    const i = z * area + y * cols + x;
                    if (0 <= z && i < data.length) {
                        return data[i];
                    }
                }
            }
            return Number.NaN;
        }
    };
}
*/

function varpackDecode(values, bytes) {
  var i = 0,
      j = 0;

  while (i < bytes.length) {
    var b = bytes[i++];

    if (b < 128) {
      b = b << 25 >> 25;
    } else {
      switch (b >> 4) {
        case 0x8:
        case 0x9:
        case 0xa:
        case 0xb:
          b = b << 26 >> 18 | bytes[i++];
          break;

        case 0xc:
        case 0xd:
          b = b << 27 >> 11 | bytes[i++] << 8 | bytes[i++];
          break;

        case 0xe:
          b = b << 28 >> 4 | bytes[i++] << 16 | bytes[i++] << 8 | bytes[i++];
          break;

        case 0xf:
          if (b === 255) {
            for (var run = 1 + bytes[i++]; run > 0; run--) {
              values[j++] = NaN;
            }

            continue;
          } else {
            b = bytes[i++] << 24 | bytes[i++] << 16 | bytes[i++] << 8 | bytes[i++];
          }

          break;
      }
    }

    values[j++] = b;
  }

  return values;
}
function undeltaPlane(values, cols, rows, grids) {
  var x, y, z, i, j, k, p;

  for (z = 0; z < grids; z++) {
    k = z * cols * rows;

    for (x = 1; x < cols; x++) {
      i = k + x;
      p = values[i - 1];
      values[i] += p === p ? p : 0;
    }

    for (y = 1; y < rows; y++) {
      j = k + y * cols;
      p = values[j - cols];
      values[j] += p === p ? p : 0;

      for (x = 1; x < cols; x++) {
        i = j + x;
        var a = values[i - 1];
        var b = values[i - cols];
        var c = values[i - cols - 1];
        p = a + b - c;
        values[i] += p === p ? p : a === a ? a : b === b ? b : c === c ? c : 0;
      }
    }
  }

  return values;
}
function dequantize(values, scaleFactor) {
  var m = Math.pow(10, scaleFactor);

  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    values[i] = v === v ? v / m : 7e37;
  }

  return values;
}
/**
 * Decodes a quantized delta-plane varpack array of floats.
 *
 * @param {Uint8Array} bytes the encoded values as an array of bytes
 * @param cols size of the x dimension
 * @param rows size of the y dimension
 * @param grids size of the z dimension
 * @param scaleFactor number of decimal digits after (+) or before (-) the decimal point to retain
 * @returns {Float32Array} the decoded values
 */

function decodePpak(bytes, cols, rows, grids, scaleFactor) {
  var values = new Float32Array(cols * rows * grids);
  varpackDecode(values, bytes);
  undeltaPlane(values, cols, rows, grids);
  dequantize(values, scaleFactor);
  return values;
}
/**
 * Decodes a ppak block from a buffer having the format:
 * <pre>
 *       int32   int32   int32      float32     byte[]
 *     [ cols ][ rows ][ grids ][ scaleFactor ][ data ]
 *      ----------------------------------------------
 *                        length
 * </pre>
 * All multi-byte values are BE. The number of resulting values is cols * rows * grids.
 *
 * @param {string} type the ppak type/version string
 * @param {ArrayBuffer} buffer the buffer
 * @param offset buffer byte offset
 * @param length the byte length of the block
 * @returns {{metadata: *, values: Float32Array}} the decoded values
 */

function decodePpakBlock(type, buffer, offset, length) {
  var view = new DataView(buffer, offset, length);
  var bytes = new Uint8Array(buffer, offset + 16, length - 16);
  var cols = view.getInt32(0);
  var rows = view.getInt32(4);
  var grids = view.getInt32(8);
  var scaleFactor = view.getFloat32(12);
  return {
    metadata: {
      type: type,
      cols: cols,
      rows: rows,
      grids: grids,
      scaleFactor: scaleFactor
    },
    values: decodePpak(bytes, cols, rows, grids, scaleFactor)
  };
}
/**
 * Earth-Pack (EPAK) format:
 * <pre>
 *     head  := "head" (BE alpha-4) length (BE int) json (UTF-8 JSON string)
 *     block :=  type  (BE alpha-4) length (BE int) data (byte[])
 *     tail  := "tail"
 *     file  :=  head [block]* tail
 *
 *     head                                  block                           tail
 *     ------------------------------------  ------------------------------  ------
 *    ["head"][0x00000003][0x10, 0x11, 0x12]["ppk2"][0x00000002][0xff, 0xff]["tail"]
 *             ----------  ----------------  ------  ----------  ----------
 *               length          json         type     length       data
 * </pre>
 *
 * @param {ArrayBuffer} buffer the buffer to decode
 * @param {Object} [options] decoding options: {headerOnly: boolean}
 * @returns {{header: *, blocks: Array, metadata: Array}} the decoded values
 */

function decodeEpak(buffer, options) {
  var headerOnly = !!(options || {}).headerOnly;
  var i = 0;
  var view = new DataView(buffer);
  var head = decodeUTF8(new Uint8Array(buffer, i, 4));
  i += 4;

  if (head !== "head") {
    throw new Error("expected 'head' but found '" + head + "'");
  }

  var length = view.getInt32(i);
  i += 4;
  var header = JSON.parse(decodeUTF8(new Uint8Array(buffer, i, length)));
  i += length;
  var block;
  var blocks = [];
  var metadata = [];
  var type;

  while ((type = decodeUTF8(new Uint8Array(buffer, i, 4))) !== "tail" && !headerOnly) {
    i += 4;
    length = view.getInt32(i);
    i += 4;

    switch (type) {
      case "ppak":
      case "ppk2":
        block = decodePpakBlock(type, buffer, i, length);
        break;

      default:
        throw new Error("unknown block type: " + type);
    }

    blocks.push(block.values);
    metadata.push(block.metadata);
    i += length;
  }

  return {
    header: header,
    blocks: blocks,
    metadata: metadata
  };
}
/**
 * Decode an array having "Packed Delta RLE" encoding. This has three steps:
 *
 *    1. Unroll runs:
 *        Replace every tuple element Si := [v, X] with the run of elements it represents: v0, .., v{X-1}
 *
 *    2. Convert running deltas into absolute values:
 *        [D0, .., D{N-1}]  =>  [T0, .., T{N-1}] where Ti := T{i-1} + Di
 *                                                     T0 := D0
 *                                                     Ti == Di when T{i-1} is null or NaN
 *
 *    3. Unpack each value:
 *        [T0, .., T{N-1}]  =>  [R0, .., R{N-1}] where Ri := Ti * scaleFactor + addOffset
 *
 * NaN and null are replaced with 7e37.
 *
 * Example:
 *     [1,[2,5],3,[null,2],4]  ->  [1,2,2,2,2,2,3,null,null,4]  ->  [1,3,5,7,9,11,14,7e37,7e37,4]
 *
 * @param {array} data the encoded array of data.
 * @param {number} scaleFactor the amount to multiply each data point by.
 * @param {number} addOffset the amount to add to each data point.
 * @param {number} length the expected length of the decoded data array.
 * @returns {Float32Array} the array of decoded data.
 */

function decodePackedDeltaRle(data, scaleFactor, addOffset, length) {
  var result = new Float32Array(length);
  var j = 0;

  for (var i = 0, prev = 0; i < data.length && j < length; i++) {
    var raw = data[i];
    var isRun = Array.isArray(raw);
    var val = isRun ? raw[0] : raw;
    var stop = isRun ? clamp(+raw[1] + j, j, length) : j + 1; // guard against malicious run lengths

    var v = +val;

    if (val === null || v !== v) {
      if (!(j < stop)) {
        continue; // ignore zero or NaN length runs
      }

      while (j < stop) {
        result[j++] = 7e37;
      }

      prev = 0;
    } else {
      while (j < stop) {
        var x = (prev = prev + v) * scaleFactor + addOffset;
        result[j++] = x === x ? x : 7e37;
      }
    }
  } // Fill remaining space in the result array, if any.


  while (j < length) {
    result[j++] = 7e37;
  }

  return result;
}