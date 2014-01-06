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

if (!process.stdin.isTTY) throw 'Input stream must be TTY.';

var debug = argv.debug;
function log(m) {
  process.stdout.write(m);
}

var osc = require('omgosc');
var oscOut = new osc.UdpSender(argv.host, argv.port);
var oscIn  = new osc.UdpReceiver(argv.iport);

var prompt = '> ';

function inpectColor(o) {
  return util.inspect(o, { colors: true });
}

function formatMessage(msg) {
  return inpectColor(msg.path)    + ' ' +
         inpectColor(msg.typetag) + ' ' +
         inpectColor(msg.params);
}

function processLine(line) {
  var args = line.split(/\s+/);

  var msg = {
    path:    args[0],
    typetag: args[1] || '',
    params:  args.slice(2)
  };

  if (debug) log('sending: ' + formatMessage(msg));

  oscOut.send(msg.path, msg.typetag, msg.params);

  cuePrompt();
}

var promptTimer = null;
var promptDelay = 10;
function cuePrompt() {
  if (promptTimer) {
    clearTimeout(promptTimer);
    promptTimer = null;
  }
  promptTimer = setTimeout(logPrompt, promptDelay);

}
function logPrompt() {
  log('\n' + prompt);
}

function printMessage(msg) {
  log('\n' + formatMessage(msg));
  cuePrompt();
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', processLine);

if (argv.iport) {
  oscIn.on('', printMessage);
}

log('Transmitting to ' + argv.host + ':' + argv.port);
log('\nListening on port ' + argv.iport);
logPrompt();
