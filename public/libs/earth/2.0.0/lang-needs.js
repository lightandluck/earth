function preferred(navigator) {
  return navigator.languages || [navigator.language || navigator.userLanguage || "en"];
}
/**
 * Parses an IETF language tag into pieces.
 *
 * {language: "zh", script: "Hans", region: "CN"}
 * {language: "en", script: "", region: "US"}
 * {language: "en", script: "", region: ""}
 * {language: "", script: "", region: ""}
 *
 * @param {string} tag
 */

function parse(tag) {
  var result = {
    language: "",
    script: "",
    region: ""
  },
      parts = (tag || "").toLowerCase().split("-");

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    if (part.length === 1) {
      // stop parsing when we hit an extension
      break;
    }

    if (i === 0) {
      result.language = part;
    } else if (/^[a-z]{4}$/.test(part)) {
      result.script = part.substring(0, 1).toUpperCase() + part.substring(1);
    } else if (/^([a-z]{2}|\d{3})$/.test(part)) {
      result.region = part.toUpperCase();
    }
  }

  return result;
}
/**
 * Returns the most appropriate match for the specified language tag, or "" if none can be found.
 *
 * @param struct a parsed IETF language tag
 * @returns {string}
 */

function match(struct) {
  // $LANG$
  switch (struct.language) {
    case "en":
      return "en";

    case "cs":
      return "cs";

    case "fr":
      return "fr";

    case "ja":
      return "ja";

    case "pt":
      return "pt";

    case "ru":
      return "ru";

    case "zh":
      switch (struct.script) {
        case "Hant":
          return "zh-TW";

        case "Hans":
          return "zh-CN";
      }

      switch (struct.region) {
        case "HK":
        case "MO":
        case "TW":
          return "zh-TW";

        case "SG":
        case "CN":
          return "zh-CN";
      }

  }

  return "";
}
function best(navigator) {
  var preference = preferred(navigator);

  for (var i = 0; i < preference.length; i++) {
    var parsed = parse(preference[i]);
    var matched = match(parsed);
    if (matched) return matched;
  }

  return "";
}