#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { watcher } from './watcher.js';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: watch-contracts [options]')
  .example('watch-contracts -p ./link/config.hjson', 'watches contract messages of link contract deployed on Rococo')
  .option('p', {
    type: 'string',
    alias: 'path',
    default: './contracts/link/config.hjson',
    describe: 'The path to the configuration file for the contract to watch',
    requiresArg: true
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'verbose')
  .argv as any;

watcher({
  configPath: argv.path,
  verbose: argv.verbose
});