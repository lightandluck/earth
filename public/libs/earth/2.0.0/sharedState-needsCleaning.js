/* harmony import */ var _utc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utc */ "./src/utc.mjs");
/* harmony import */ var _micro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../micro */ "./src/micro.mjs");
/* harmony import */ var underscore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");
/* harmony import */ var _globes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../globes */ "./src/globes.mjs");
/* harmony import */ var _products__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../products */ "./src/products.mjs");
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./model */ "./src/framework/model.mjs");
/* harmony import */ var _d3__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../d3 */ "./src/d3.mjs");







var overlayTypes = _products__WEBPACK_IMPORTED_MODULE_4__["products"].overlayTypes(); // const DEFAULT_CONFIG = "current/wind/surface/level/orthographic";

function defaultState() {
  return Object(_micro__WEBPACK_IMPORTED_MODULE_1__["ø"])({
    date: "current",
    param: "wind",
    surface: "surface",
    level: "level",
    projection: "orthographic",
    orientation: "",
    overlayType: "default",
    showGridPoints: false,
    animate: true,
    loc: null,
    argoFloat: null
  });
}

function initialState() {
  var empty = Object(_micro__WEBPACK_IMPORTED_MODULE_1__["ø"])();
  Object.keys(defaultState()).forEach(function (key) {
    return empty[key] = undefined;
  });
  return empty;
}

function fromHashFragment(hash) {
  var option; //                1        2        3          4          5            6      7      8    9

  var tokens = /^#(current|(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{3,4})Z)\/(\w+)\/(\w+)\/(\w+)([\/].+)?/.exec(hash);

  if (!tokens) {
    return defaultState();
  }

  var date = tokens[1] === "current" ? "current" : {
    year: +tokens[2],
    month: +tokens[3],
    day: +tokens[4]
  };

  if (date !== "current") {
    var hour = (tokens[5].length === 3 ? "0" : "") + tokens[5];
    date.hour = +hour.substr(0, 2);
    date.minute = +hour.substr(2);
  }

  var result = defaultState();
  result.date = date;
  result.param = tokens[6];
  result.surface = tokens[7];
  result.level = tokens[8];
  Object(_micro__WEBPACK_IMPORTED_MODULE_1__["coalesce"])(tokens[9], "").split("/").forEach(function (segment) {
    if (option = /^(\w+)(=([\d\-.,]*))?$/.exec(segment)) {
      if (underscore__WEBPACK_IMPORTED_MODULE_2__.has(_globes__WEBPACK_IMPORTED_MODULE_3__, option[1])) {
        result.projection = option[1]; // non-empty alphanumeric _

        result.orientation = Object(_micro__WEBPACK_IMPORTED_MODULE_1__["coalesce"])(option[3], ""); // comma delimited string of numbers, or ""
      } else if (option[1] === "loc") {
        var parts = underscore__WEBPACK_IMPORTED_MODULE_2__.isString(option[3]) ? option[3].split(",") : [];
        var λ = +parts[0],
            φ = +parts[1];

        if (λ === λ && φ === φ) {
          result.loc = [λ, φ];
        }
      }
    } else if (option = /^overlay=([\w.]+)$/.exec(segment)) {
      if (overlayTypes.has(option[1]) || option[1] === "default") {
        result.overlayType = option[1];
      }
    } else if (option = /^grid=(\w+)$/.exec(segment)) {
      if (option[1] === "on") {
        result.showGridPoints = true;
      }
    } else if (option = /^anim=(\w+)$/.exec(segment)) {
      if (option[1] === "off") {
        result.animate = false;
      }
    } else if (option = /^argo=(\w+)$/.exec(segment)) {
      switch (option[1]) {
        case "planned":
        case "recent":
        case "operational":
        case "dead":
          result.argoFloat = option[1];
      }
    }
  });
  return result;
}

function toHashFragment(attr) {
  var date = attr.date,
      param = attr.param,
      surface = attr.surface,
      level = attr.level,
      projection = attr.projection,
      orientation = attr.orientation,
      overlayType = attr.overlayType,
      showGridPoints = attr.showGridPoints,
      animate = attr.animate,
      loc = attr.loc,
      argoFloat = attr.argoFloat;
  var dir = date === "current" ? "current" : _utc__WEBPACK_IMPORTED_MODULE_0__["print"](date, "{yyyy}/{MM}/{dd}/{hh}{mm}Z");
  var proj = [projection, orientation].filter(function (x) {
    return x;
  }).join("=");
  var ol = !overlayType || overlayType === "default" ? "" : "overlay=" + overlayType;
  var location = loc ? "loc=" + loc.map(function (e) {
    return e.toFixed(3);
  }).join(",") : "";
  var grid = showGridPoints ? "grid=on" : "";
  var anim = animate ? "" : "anim=off";
  var argo = argoFloat ? "argo=" + argoFloat : "";
  return "#" + [dir, param, surface, level, anim, ol, grid, argo, proj, location].filter(function (x) {
    return x;
  }).join("/");
}

var model = Object(_model__WEBPACK_IMPORTED_MODULE_5__["createModel"])(initialState());

function readHashFragment() {
  var hash = window.location.hash;
  var attributes = fromHashFragment(hash);
  model.save(attributes, {
    source: "hash"
  });
}

function writeHashFragment(delta, old) {
  var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var attributes = model.getAll();
  var changed = toHashFragment(attributes); // change the hash fragment only when there's a difference, and only when the change wasn't itself triggered by
  // a hash change.

  if (window.location.hash !== changed && meta.source !== "hash") {
    window.location.hash = changed;
  }
}

function attach() {
  model.on("change.affects-hash", writeHashFragment);
  _d3__WEBPACK_IMPORTED_MODULE_6__["select"](window).on("hashchange.affects-config", readHashFragment);
  readHashFragment();
}