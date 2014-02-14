#!/usr/bin/env node

var util = require('util');

var optimist = require('optimist')
  .usage('Usage: oscr -h [hostname] -p [port]')

  .alias('h', 'host')
  .describe('h', 'Remote Hostname')

  .alias('p', 'port')
  .describe('p', 'Remote Port')

  .alias('i', 'iport')
  .describe('i', 'Local Port')

  .alias('s', 'snoop')
  .describe('s')

  .demand([ 'h', 'p' ])

var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit();
}

if (argv.snoop && !argv.iport) {
  optimist.showHelp();
  console.error('Missing required argument: i');
  process.exit(1);
}

function evalArg(arg) {
  try { return eval(arg) } catch(err) {}
  return eval('"' + arg + '"');
}

function createMessage(line) {
  var args = line.split(/\s+/);
  return {
    path:    evalArg(args[0]),
    typetag: evalArg(args[1]) || '',
    params:  args.slice(2).map(evalArg)
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


var osc    = require('omgosc');
var oscOut = new osc.UdpSender(argv.host, argv.port);
var oscIn  = new osc.UdpReceiver(argv.iport);

if (argv.iport) {
  oscIn.on('', function (msg) {
    printMessage(msg);
    if (argv.snoop) {
      oscOut.send(msg.path, msg.typetag, msg.params);
    }
  });
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
