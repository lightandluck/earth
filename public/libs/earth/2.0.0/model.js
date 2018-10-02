function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * A Model is a map that emits events when its entries change. The set of allowable keys is fixed at creation time
 * using the specified initial state.
 *
 * const model = createModel({a: 1, b: 2});
 * model.on("change",   (delta, old, meta) => console.log(`change ${delta}, ${old}, ${meta}`));
 * model.on("change:b", (delta, old, meta) => console.log(`change:b ${delta}, ${old}, ${meta}`));
 *
 * model.get("a");             // 1
 * model.save({a: 2});         // "change {a: 2}, {a: 1}, undefined"
 * model.save({a: 3}, "foo");  // "change {a: 3}, {a: 2}, foo"
 * model.save({a: 4, b: 0});   // "change:b 0, 2, undefined" and "change {a: 4, b: 0}, {a: 3, b: 2}, undefined"
 *
 * Attribute changes are detected using _.isEqual deep comparison.
 *
 * UNDONE: Given all the constraints, probably best to build own implementation of dispatcher.
 *
 * @param {Object} initialState the fixed set of keys and their initial values.
 * @returns {Model}
 */

function createModel(initialState) {
  var keys = Object.keys(initialState);
  var dispatch = d3.dispatch.apply(undefined, ["change"].concat(keys.map(function (key) {
    return "change:".concat(key);
  })));
  var attributes = ø(initialState);
  var seq = 0;

  function interpret(typenames) {
    return typenames.trim().split(/^|\s+/).map(function (t) {
      return t.replace("?", seq++);
    });
  }

  return new (
  /*#__PURE__*/
  function () {
    function Model() {
      _classCallCheck(this, Model);
    }

    _createClass(Model, [{
      key: "on",

      /**
       * Registers a callback for the specified typenames. Basically the same as D3 dispatch.on() except that this
       * method returns the array of parsed typenames when a callback is specified. The typename may contain the
       * character "?", which is replaced with an auto-incrementing number to ensure the name is unique. The unqiue
       * name is then returned by this method.
       *
       * There are two event patterns:
       *
       *     "change"        fired when any attribute changes
       *                     callback ƒ(delta, old, meta)
       *                         delta: map of changed attributes
       *                         old:   map of original attributes
       *                         meta:  the (optional) object specified on the call to save()
       *
       *     "change:<key>"  fired when attribute for <key> changes
       *                     callback ƒ(delta, old, meta)
       *                         delta: the new attribute value
       *                         old:   the old attribute value
       *                         meta:  the (optional) object specified on the call to save()
       *
       * model.on("change",     ƒ);  // adds handler for "change" event
       * model.on("change",     ƒ);  // replaces previous handler for "change" event
       * model.on("change.foo", ƒ);  // adds handler for "change" event with name "foo"
       * model.on("change.bar", ƒ);  // adds handler for "change" event with name "bar"
       * model.on("change.?",   ƒ);  // adds handler for "change" event with a unique name to ensure no previous
       *                             // handler is replaced, returning the actual name used, e.g.: ["change.5"]
       *
       * model.on("change:a change:b", ƒ);  // adds handler for both "change:a" and "change:b"
       *
       * model.on("change");        // returns handler for "change" event
       * model.on("change.foo");    // returns handler for "change" event for name "foo"
       * model.on("change", null);  // removes the handler for "change" event
       * model.on(".foo", null);    // removes all handlers for name "foo"
       *
       * @param {string} typenames
       * @param {Function} [callback] ƒ(delta, old, meta)
       * @returns {string[]|Function} the parsed typenames if callback specified, otherwise the callback registered
       *                              for the specified typename.
       */
      value: function on(typenames, callback) {
        var tn = interpret(typenames);
        var result = dispatch.on(tn.join(" "), callback);
        return arguments.length < 2 ? result : tn;
      }
      /** @param {string} key */

    }, {
      key: "get",
      value: function get(key) {
        return attributes[key];
      }
      /** @returns {Object} a shallow copy of this model's attributes */

    }, {
      key: "getAll",
      value: function getAll() {
        return ø(attributes);
      }
      /**
       * Examples:
       *     model.save({a: 1});                      // raises "change" and "change:a" events
       *     model.save({a: 1, b: 2}, {foo: "bar"});  // raises "change", "change:a", and "change:b" events
       *
       * @param {Object} changes the entries to change on this model. Events are raised if changes from this model's
       *                 current state are found using _.isEqual deep comparison.
       * @param {*} [meta] optional value passed directly to any callbacks invoked by this change.
       */

    }, {
      key: "save",
      value: function save(changes, meta) {
        var delta = ø();
        var old = ø();
        Object.keys(changes).forEach(function (key) {
          if (!(key in attributes)) {
            throw new Error("unknown key: ".concat(key));
          }

          var value = changes[key];
          var oldValue = attributes[key];

          if (!_.isEqual(value, oldValue)) {
            delta[key] = value;
            old[key] = oldValue;
          }
        });
        var keys = Object.keys(delta);

        if (keys.length > 0) {
          keys.forEach(function (key) {
            return attributes[key] = delta[key];
          });
          keys.forEach(function (key) {
            return dispatch.call("change:".concat(key), null, delta[key], old[key], meta);
          });
          dispatch.call("change", null, delta, old, meta);
        }
      }
    }]);

    return Model;
  }())();
}