/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");
/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(underscore__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _d3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./d3 */ "./src/d3.mjs");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./micro */ "./src/micro.mjs");
/* harmony import */ var _blacklist__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./blacklist */ "./src/blacklist.mjs");
/* harmony import */ var _earth__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./earth */ "./src/earth.mjs");
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./log */ "./src/log.js");








 // import bridge from "./bridge";
// work-around for iOS 10 bug: https://github.com/metafizzy/flickity/issues/457

window.addEventListener("touchmove", function () {}); //require("./clock").calibration({server: "/"}); /*calibration({fixed: "2015-11-24T00:00Z"});*/

global.earth = _earth__WEBPACK_IMPORTED_MODULE_5__["default"];

global.main = function (bridge) {
  bridge = bridge || {};
  var log = Object(_log__WEBPACK_IMPORTED_MODULE_6__["default"])(bridge.console);
  var app = {
    log: log,
    bridge: bridge
  };

  if (_micro__WEBPACK_IMPORTED_MODULE_3__["isDevMode"]()) {
    log.debug("dev mode enabled");
  }

  underscore__WEBPACK_IMPORTED_MODULE_1___default.a.defer(_earth__WEBPACK_IMPORTED_MODULE_5__["default"], app); // defer all side effects

};

if (_micro__WEBPACK_IMPORTED_MODULE_3__["isEmbeddedInIFrame"]() && underscore__WEBPACK_IMPORTED_MODULE_1___default.a.isFunction(window.ga)) {
  window.ga("send", "event", "iframe", document.referrer.split("/")[2] || document.referrer);
}

if (_micro__WEBPACK_IMPORTED_MODULE_3__["isEmbeddedInIFrame"]() && _blacklist__WEBPACK_IMPORTED_MODULE_4__["contains"](document.referrer)) {
  _blacklist__WEBPACK_IMPORTED_MODULE_4__["deny"]();
} else if (_micro__WEBPACK_IMPORTED_MODULE_3__["isAppMode"]()) {
  _d3__WEBPACK_IMPORTED_MODULE_2__["select"]("#details").classed("invisible", true);
} else {
  // global.main(bridge);
  global.main();
}