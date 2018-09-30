/**
 * utc: utilities for working with datetimes.
 *
 * CONSIDER: a datetime starts at year, a duration is a partial datetime. So is {year: 2015} a datetime or a duration?
 * How about {year: 2016, month: 2, day: 14}?
 */

var all = ["year", "month", "day", "hour", "minute", "second", "milli"];

function coalesce(a, b) {
  return a !== undefined && a !== null ? a : b;
}
/**
 * Returns the string representation of a number padded with leading characters to make
 * it at least "width" length.
 *
 * @param {Number} n the number to convert to a padded string
 * @param {Number} width the desired minimum width of the resulting string
 * @param {string} [char] the character to use for padding, default is "0"
 * @returns {string} the padded string
 */


function pad(n, width, char) {
  var s = n.toString();
  var i = Math.max(width - s.length, 0);
  return new Array(i + 1).join(char || "0") + s;
}
/**
 * @param {Date|String|Number} date a Date object, or parsable date string (Note: "yyyy-MM-ddThh:mm:ss" and its
 *        prefixes are interpreted in UTC zone.)
 * @returns {Date} a Date object
 */


function asDate(date) {
  date = coalesce(date, "");

  if (_.isString(date) || _.isNumber(date)) {
    date = new Date(date);
  }

  return date;
}
/**
 * @param {Date|String|Number} date a Date object, or parsable date string (Note: "yyyy-MM-ddThh:mm:ss" and its
 *        prefixes are interpreted in UTC zone.)
 * @returns {Object} all UTC parts of the date: "year", "month", "day", "hour", "minute", "second", "milli"
 */


function parts(date) {
  date = asDate(date);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    milli: date.getUTCMilliseconds()
  };
}
/**
 * @param {Date|String|Number} date a Date object, or parsable date string (Note: "yyyy-MM-ddThh:mm:ss" and its
 *        prefixes are interpreted in UTC zone.)
 * @returns {Object} all Local parts of the date: "year", "month", "day", "hour", "minute", "second", "milli"
 */

function localParts(date) {
  date = asDate(date);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    milli: date.getMilliseconds()
  };
}
/**
 * @param {Object} parts the UTC date parts.
 * @returns {Date} the Date representation of the specified parts.
 */

function date(parts) {
  var year = +coalesce(parts.year, 0);
  var result = new Date(Date.UTC(year, coalesce(parts.month, 1) - 1, coalesce(parts.day, 1), coalesce(parts.hour, 0), coalesce(parts.minute, 0), coalesce(parts.second, 0), coalesce(parts.milli, 0)));

  if (+result === +result && 0 <= year && year <= 99) {
    result.setUTCFullYear(year); // fix issue that two digit years are mapped to 1900-1999
  }

  return result;
}
/**
 * Adjusts UTC date parts so that they represent an actual date. Parts that overflow, like {hour: 36}, are
 * adjusted to their proper range by carrying-over to the next larger part. Missing parts are added.
 *
 * @param parts the UTC date parts to normalize.
 * @returns {{year: number, month: number, day: number, hour: number, minute: number, second: number, milli:
 *     number}} all UTC parts adjusted to represent an actual date.
 */

function normalize(parts) {
  return _parts(date(parts));
}
var _parts = parts;
/**
 * @param {Object} parts the UTC date parts.
 * @param {Object} delta the parts to add. For example: {hour: 1, minute: 30}.
 * @returns {{year: number, month: number, day: number, hour: number, minute: number, second: number, milli:
 *     number}} all UTC parts with the delta added.
 */

function add(parts, delta) {
  var result = _.clone(parts);

  _.intersection(Object.keys(delta), all).forEach(function (key) {
    result[key] = +coalesce(result[key], 0) + +delta[key];
  });

  return result;
}
/**
 * @returns {Number} standard comparator result. Both arguments are converted to Unix millis then compared.
 *          Invalid dates are smaller/earlier than all valid dates.
 */

function compare(aParts, bParts) {
  var a = date(aParts).getTime();

  if (isNaN(a)) {
    a = -Infinity;
  }

  var b = date(bParts).getTime();

  if (isNaN(b)) {
    b = -Infinity;
  }

  return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * @param {Object} parts the UTC date parts.
 * @param {string} format the format specification. Example: "{yyyy}-{MM}-{dd}T{hh}:{mm}:{ss}.{SSS}"
 * @returns {string} the formatted date.
 */

function print(parts, format) {
  var builder = [];

  for (var i = 0; i < format.length; i++) {
    var c = format[i];

    if (c !== "{") {
      builder.push(c);
      continue;
    }

    var spec = "";

    for (i++; i < format.length; i++) {
      c = format[i];

      if (c !== "}") {
        spec += c;
        continue;
      }

      var value = NaN;

      switch (spec[0]) {
        case "y":
          value = +parts.year;
          break;

        case "M":
          value = +parts.month;
          break;

        case "d":
          value = +parts.day;
          break;

        case "h":
          value = +parts.hour;
          break;

        case "m":
          value = +parts.minute;
          break;

        case "s":
          value = +parts.second;
          break;

        case "S":
          value = +parts.milli;
          break;
      }

      if (value === value) {
        builder.push(pad(value, spec.length));
      } else {
        builder.push("{", spec, "}");
      }

      break;
    }
  }

  return builder.join("");
}
function parse(s, format, groups) {
  var parts = {};

  function assign(key, value) {
    if (value === value) {
      parts[key] = value;
    }
  }

  groups = groups || {
    year: 1,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    milli: 7
  };
  var match = format.exec(s);

  if (match) {
    assign("year", +match[groups.year]);
    assign("month", +match[groups.month]);
    assign("day", +match[groups.day]);
    assign("hour", +match[groups.hour]);
    assign("minute", +match[groups.minute]);
    assign("second", +match[groups.second]);
    assign("milli", +match[groups.milli]);
  }

  return parts;
}
function printISO(parts) {
  return date(parts).toISOString();
}
function largest(parts) {
  for (var i = 0; i < all.length; i++) {
    if (all[i] in parts) {
      return all[i];
    }
  }

  return undefined;
}
function smallest(parts) {
  for (var i = all.length - 1; i >= 0; i--) {
    if (all[i] in parts) {
      return all[i];
    }
  }

  return undefined;
}
function chop(key, dt) {
  var result = {};

  for (var i = 0; i < all.length; i++) {
    var field = all[i];

    if (field in dt) {
      result[field] = dt[field];
    }

    if (field === key) {
      break;
    }
  }

  return result;
}
/**
 * Carry-over any overflowing field to the next biggest.
 *     {hour: 2, minute: 65}  ->  {hour: 3, minute: 5}
 *
 * Overflowing stops at the largest defined field, up to "day". For example:
 *              {minute: 65}  ->  {minute: 65}
 *     {hour: 0, minute: 65}  ->  {hour: 1, minute: 5}
 *
 * @param {Object} parts the UTC date parts.
 * @returns {Object} new UTC date parts where any overflow has been carried over to the next biggest field.
 */

function carry(parts) {
  // CONSIDER: normalize and carry are pretty similar, except that carry is meant for durations (stops at "day").
  var result = {};
  if (parts.year !== undefined) result.year = parts.year;
  if (parts.month !== undefined) result.month = parts.month;
  var stop = largest(parts);
  var day = parts.day;
  var hour = parts.hour;
  var minute = parts.minute;
  var second = parts.second;
  var milli = parts.milli;

  if (stop !== "milli") {
    if (milli >= 1000) {
      second = coalesce(second, 0) + Math.floor(milli / 1000);
      milli %= 1000;
    }

    if (stop !== "second") {
      if (second >= 60) {
        minute = coalesce(minute, 0) + Math.floor(second / 60);
        second %= 60;
      }

      if (stop !== "minute") {
        if (minute >= 60) {
          hour = coalesce(hour, 0) + Math.floor(minute / 60);
          minute %= 60;
        }

        if (stop !== "hour") {
          if (hour >= 24) {
            day = coalesce(day, 0) + Math.floor(hour / 24);
            hour %= 24;
          }
        }
      }
    }
  }

  if (day !== undefined) result.day = day;
  if (hour !== undefined) result.hour = hour;
  if (minute !== undefined) result.minute = minute;
  if (second !== undefined) result.second = second;
  if (milli !== undefined) result.milli = milli;
  return result;
}
/**
 * @param parts the input datetime.
 * @returns {Object} a datetime with all parts specified, filled in with zero when undefined.
 */

function fill(parts) {
  return {
    year: parts.year || 0,
    month: parts.month || 0,
    day: parts.day || 0,
    hour: parts.hour || 0,
    minute: parts.minute || 0,
    second: parts.second || 0,
    milli: parts.milli || 0
  };
}
/**
 * Accumulates the total duration of time into one part specified by key. Standard durations are used. Years and
 * months are ignored because they convert to a variable number of days.
 *
 *       "hour", {hour: 2, minute: 65}  ->  {hour: 3}
 *     "minute", {hour: 2, minute: 65}  ->  {minute: 185}
 *     "second", {hour: 2, minute: 65}  ->  {second: 11100}
 *
 * @param {string} key the part to accumulate time into.
 * @param {Object} parts the input duration.
 * @returns {Object} datetime with one part, {key: }, where all the time has been accumulated into it.
 */


function accumulate(key, parts) {
  var smoothed = carry(fill(parts));
  var accum = smoothed.day;

  if (key === "day") {
    return {
      day: accum
    };
  }

  accum = accum * 24 + smoothed.hour;

  if (key === "hour") {
    return {
      hour: accum
    };
  }

  accum = accum * 60 + smoothed.minute;

  if (key === "minute") {
    return {
      minute: accum
    };
  }

  accum = accum * 60 + smoothed.second;

  if (key === "second") {
    return {
      second: accum
    };
  }

  accum = accum * 1000 + smoothed.milli;

  if (key === "milli") {
    return {
      milli: accum
    };
  }

  var result = {};
  result[key] = undefined;
  return result;
}
/**
 * @param start the starting UTC parts, inclusive
 * @param end the ending UTC parts, inclusive
 * @param delta the UTC parts
 * @returns {Array} a range of UTC parts separated by delta
 */

function range(start, end, delta) {
  var results = [];

  for (var i = start; compare(i, end) <= 0; i = add(i, delta)) {
    results.push(carry(i));
  }

  return results;
}
/**
 * @param {Object} dt the datetime.
 * @returns {number} the ordinal number of days from Jan 1 of the input year, starting at 1.
 */

function dayOfYear(dt) {
  var d1 = date(dt),
      d0 = date({
    year: d1.getUTCFullYear()
  });
  return Math.floor((d1 - d0) / (24 * 60 * 60 * 1000)) + 1; // No daylight savings in UTC.
}