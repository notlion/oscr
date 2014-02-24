#!/usr/bin/env node

var util    = require('util');
var unquote = require('./unquote');

var optimist = require('optimist')
  .usage('Usage: oscr -h [hostname] -p [port]')

  .alias('h', 'host')
  .describe('h', 'Remote Hostname')

  .alias('p', 'port')
  .describe('p', 'Remote Port')

  .alias('i', 'iport')
  .describe('i', 'Local Port')

  .boolean('s')
  .alias('s', 'snoop')
  .describe('s', 'Forward incoming messages to remote host')

  .demand([ 'h', 'p' ]);

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

function escapeQuotes(str) {
  return str.replace(/\\?"/g, '\\\"').replace(/\\?'/g, "\\\'")
}

function evalArg(arg) {
  var res;
  try { res = eval(arg); } catch (err) {}
  if (res === undefined) {
    res = eval('"' + escapeQuotes(arg) + '"');
  }
  return res;
}

function createMessage(line) {
  var args = unquote(line);
  return {
    path:    evalArg(args[0]),
    typetag: evalArg(args[1]) || '',
    params:  args.slice(2).map(evalArg)
  };
}

function sendMessage(msg) {
  if (msg.params.length < msg.typetag.length) {
    return console.error('Too few arguments for typetag: %s', msg.typetag);
  }
  try {
    oscOut.send(msg.path, msg.typetag, msg.params);
  }
  catch (err) {
    return console.error(err);
  }
  return msg;
}

function logPrompt() {
  process.stdout.write('\n> ');
}

var promptTimer = null;
function cuePrompt(delay) {
  if (promptTimer) {
    clearTimeout(promptTimer);
    promptTimer = null;
  }
  promptTimer = setTimeout(logPrompt, delay);
}

function printMessage(msg) {
  process.stdout.write('\n' + util.inspect(msg, { colors: true }));
  cuePrompt(100);
}


var osc    = require('omgosc');
var oscOut = new osc.UdpSender(argv.host, argv.port);
var oscIn  = new osc.UdpReceiver(argv.iport);

if (argv.iport) {
  oscIn.on('', function(msg) {
    printMessage(msg);
    if (argv.snoop) {
      oscOut.send(msg.path, msg.typetag, msg.params);
    }
  });
}

require('repl').start({
  'eval': function(cmd, context, filename, callback) {
    if (cmd.length > 3) {
      var res = sendMessage(createMessage(cmd.slice(1, -2)));
      callback(null, res);
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
