var matchArgs = new RegExp([
  '"((?:\\\\.|[^"\\\\])*)"', // Double quoted
  "'((?:\\\\.|[^'\\\\])*)'", // Single quoted
  '((?:\\\\.|\\S)+)'         // Bare words
].join('|'), 'g');

function firstDefined(arr) {
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (arr[i] !== undefined) return arr[i];
  }
}

module.exports = function(argsStr) {
  var arg, args = [];
  while (arg = matchArgs.exec(argsStr)) {
    args.push(firstDefined(arg.slice(1)));
  }
  return args;
};
