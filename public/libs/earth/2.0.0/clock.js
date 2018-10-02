/*
 * clock: a singleton wall clock that can be calibrated against the server or explicitly set.
 *
 *   const clock = require("./clock");                                    // uncalibrated clock using system time
 *   const clock = require("./clock").calibration({fixed: new Date()});   // clock set to a fixed time
 *   const clock = require("./clock").calibration({server: "/"});         // clock synchronized with server at url
 *
 *   const calibration = clock.calibration();                             // current calibration
 *   clock.calibrated().then(calibration => console.log(calibration));    // promise for pending calibration
 *
 *   clock.now();  // current time according to clock, in millis.
 *
 * Example calibrations:
 *   {skew: 0}                   // uncalibrated
 *   {fixed: 1448172991313}      // fixed
 *   {skew: 0, δ: 200, θ: 300}   // server calibrated
 */
// CONSIDER: switch this to a registry of Clock objects that each have a name. Default instance can have an
// undefined name. This avoids a singleton instance which is unnecessarily restrictive.
var _now = skewClock;
var _calibration = {
  skew: 0
};

var _p = Promise.resolve(_calibration);

function skewClock() {
  return Date.now() + _calibration.skew;
}

function fixedClock() {
  return _calibration.fixed;
}

function calibrate(url) {
  // Calculate offset θ by measuring round-trip time δ of an HTTPS request against the "Date" header of the
  // response (i.e., the server's time). See https://en.wikipedia.org/wiki/Network_Time_Protocol.
  //
  // server      t1--t2
  //            /      \
  // client   t0        t3
  //
  // The precision of t0 and t3 is in milliseconds whereas t1 and t2 is in seconds. But we don't care because
  // we don't need sub-second accuracy.
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    var t0 = Date.now();

    req.onload = function () {
      var t3 = Date.now();
      var t2 = new Date(req.getResponseHeader("Date")).getTime() || NaN;
      var t1 = t2;
      var δ = t3 - t0 - (t2 - t1);
      var θ = (t1 - t0 + (t2 - t3)) / 2; // Use offset when larger than 10 sec and larger than round-trip by an order of magnitude. Seems legit.

      var skew = Math.abs(θ) > Math.max(10000, δ * 10) ? θ : 0;
      resolve({
        skew: skew,
        δ: δ,
        θ: θ
      });
    };

    req.onerror = reject;
    req.open("HEAD", url);
    req.setRequestHeader("Cache-Control", "no-cache");
    req.send();
  });
}
/** @returns {number} unix time */


function now() {
  return _now();
}
/**
 * @param {Object?} c sets the calibration: {server: url} or {fixed: date}. When server specified, an XHR fetches
 *        the server time. The `calibrated` method returns this operation's promise. Example server url: "/"
 * @returns {Object} current calibration {skew: number} or {fixed: number}, or undefined when setting calibration.
 */

function calibration(c) {
  if (c === undefined) {
    return _calibration;
  }

  if (typeof c.server === "string") {
    _p = calibrate(c.server).then(function (c) {
      _now = skewClock;
      return _calibration = c;
    });
  } else {
    var fixed = +new Date(c.fixed);

    if (fixed === fixed) {
      _now = fixedClock;
      _p = Promise.resolve(_calibration = {
        fixed: fixed
      });
    } else {
      _now = skewClock;
      _p = Promise.resolve(_calibration = {
        skew: +c.skew || 0
      });
    }
  }
}
/** @returns {Promise} a promise for the most recently set calibration. */

function calibrated() {
  return _p;
}