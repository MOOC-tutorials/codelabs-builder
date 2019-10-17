
'use strict';

const childprocess = require('child_process');
const spawn = childprocess.spawn;

const http = require('http');
const fs = require('fs');

// claat is a wrapper around the claat tool.
//
//   cwd - codelabs content dir
//   cmd - claat command, either 'update' or 'export'
//   auth - auth token to use
//   fmt - output format, e.g. 'html'
//   args - an array of source doc IDs or codelab names (IDs)
//   callback - an async task callback function
// Based on: https://github.com/googlecodelabs/tools/blob/master/site/tasks/helpers/claat.js
exports.run = (cwd, cmd, auth, fmt, args, callback) => {
  args.unshift(cmd, '-auth', auth, '-f', fmt);
  const proc = spawn('./claat', args, { stdio: 'inherit', cwd: cwd, env: process.env });
  
  proc.on('close', (e) => {
    if (e) {
      throw new Error(e);
    }
    callback();
    });
};