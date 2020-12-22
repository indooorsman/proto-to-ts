#!/usr/bin/env node
const parse = require('./lib/convertor.js');
const fs = require('fs');
const path = require('path');
const args = process.argv;

const sourceFlag = '-f';
const targetFlag = '-o';

const sourceFlagIndex = args.indexOf(sourceFlag);
const targetFlagIndex = args.indexOf(targetFlag);
if (sourceFlagIndex === -1) {
  console.log('Usage: pb2ts -f /proto/file/path/x.proto -o /output/path/of/ts/file/x.ts');
} else {
  const filePathIndex = sourceFlagIndex + 1;
  const filePath = args[filePathIndex];
  fs.readFile(path.resolve(__dirname, filePath), { encoding: 'utf8' }, (e, data) => {
    const ts = parse(data);
    if (targetFlagIndex === -1) {
      console.log(ts);
    } else {
      const outputFilePath = args[targetFlagIndex + 1];
      fs.writeFile(path.resolve(__dirname, outputFilePath), ts, { encoding: 'utf8' }, (e) => {
        if (e) {
          console.error(e);
        } else {
          console.log('Done!');
        }
      });
    }
  });
}
