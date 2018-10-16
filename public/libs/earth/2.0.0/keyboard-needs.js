function() { return key; });
/**
 * @param {string} type event type
 * @param {string} key the key property
 * @param {number} which the browser-specific numeric key code
 * @param {string} str the string representation of the numeric key code
 * @returns {string} the normalized 'key' value.
 */
function normalize(type, key, which, str) {
  if (key) {
    switch (key) {
      case "Esc":
        return "Escape";
    }

    return key; // Use the key property if it exists.
  }

  switch (which) {
    case 27:
      return "Escape";
  }

  if (type === "keypress" && str) {
    return str; // The string representation is acceptable for keypress events. For keyup and keydown, it is not.
  }

  return "NYI";
}
/**
 * @param {KeyboardEvent} event the keyboard keyup, keypress, or keydown event.
 * @return {string} the 'key' property of the event (or equivalent if not yet supported by the browser), or "NYI"
 *         if I haven't bothered to investigate cross browser behavior for the specific key.
 */


function key(event) {
  var type = event.type,
      key = event.key,
      which = +event.which,
      str = String.fromCharCode(which); //console.log("type", type, "key", key, "which", which, "str", str, " => ", normalize(type, key, which, str));

  return normalize(type, key, which, str);
}