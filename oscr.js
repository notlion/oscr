#!/usr/bin/env node

var util = require('util');
var optimist = require('optimist')
  .usage('oscr: Start an OSC(Open Sound Control) REPL.\nUsage: $0')

  .alias('h', 'host')
  .describe('h', 'Remote Hostname')
  .default('h', 'localhost')

  .alias('p', 'port')
  .describe('p', 'Remote Port')
  .default('p', 7777)

  .alias('i', 'iport')
  .describe('i', 'Local Port')
  .default('i', 8000)

var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit();
}

var osc    = require('omgosc');
var oscOut = new osc.UdpSender(argv.host, argv.port);
var oscIn  = new osc.UdpReceiver(argv.iport);

function evalArg(arg) {
  try {
    return eval(arg);
  }
  catch(err) {}
  return eval('"' + arg + '"');
}

function createMessage(line) {
  var args = line.split(/\s+/);
  return {
    path:    evalArg(args[0]),
    typetag: evalArg(args[1]) || '',
    params:  evalArg(args.slice(2))
  };
}

var promptTimer = null;
function cuePrompt(delay) {
  if (promptTimer) {
    clearTimeout(promptTimer);
    promptTimer = null;
  }
  promptTimer = setTimeout(logPrompt, delay);

}
function logPrompt() {
  process.stdout.write('\n> ');
}


function printMessage(msg) {
  process.stdout.write('\n' + util.inspect(msg, { colors: true }));
  cuePrompt(100);
}

if (argv.iport) {
  oscIn.on('', printMessage);
}

require('repl').start({
  'eval': function(cmd, context, filename, callback) {
    if (cmd.length > 3) {
      var msg = createMessage(cmd.slice(1, -2));
      oscOut.send(msg.path, msg.typetag, msg.params);
      callback(null, msg);
    }
    else {
      callback(null);
    }
  },
  ignoreUndefined: true
})
.on('exit', function() {
  process.exit();
});
