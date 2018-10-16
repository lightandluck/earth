function extract(ref, f) {
  return typeof f === "function" ? f.bind(ref) : function () {};
}

console = console || global.console || {};
return {
  debug: extract(console, console.log),
  info: extract(console, console.info),
  warn: extract(console, console.warn),
  error: extract(console, console.error),
  time: extract(console, console.time),
  timeEnd: extract(console, console.timeEnd)
};