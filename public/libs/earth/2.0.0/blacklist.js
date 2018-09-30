var blacklist = [/dailymail/i, /tamilinstanews/i, /xtremeweatherforecast/i, /oracle77.asuscomm/i];
function contains(referrer) {
  var host = referrer.split("/")[2] || "";
  return blacklist.some(function (regex) {
    return regex.test(host);
  });
}
function deny() {
  return _d3__WEBPACK_IMPORTED_MODULE_0__["select"]("body").attr("style", "font-size: 12em; color: red;").text("XX - contact @cambecc").selectAll("*").remove();
}