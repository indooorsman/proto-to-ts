#!/usr/bin/env node
const parse = require('./lib/convertor.js');
const fs = require('fs');
const path = require('path');
const args = process.argv;

const flag = '-f';

const flagIndex = args.indexOf(flag);
if (flagIndex === -1) {
  console.log('Usage: proto-to-ts -f /proto/file/path');
} else {
  const filePathIndex = flagIndex + 1;
  const filePath = args[filePathIndex];
  fs.readFile(path.resolve(__dirname, filePath), { encoding: 'utf8' }, (e, data) => {
    console.log(parse(data));
  });
}
