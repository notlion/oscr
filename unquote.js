var matchArgs = new RegExp([
  '"((?:\\\\.|[^"\\\\])*)"', // Double quoted
  "'((?:\\\\.|[^'\\\\])*)'", // Single quoted
  '((?:\\\\.|\\S)+)'         // Bare words
].join('|'), 'g');

module.exports = function(argsStr) {
  var arg, args = [];
  while (arg = matchArgs.exec(argsStr)) {
    args.push(arg[3] || arg[2] || arg[1]);
  }
  return args;
};
