#!/usr/bin/env ts-node-esm

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { watcher } from './watcher.js';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .example('$0 -v -p ./config.hjson', 'watches contract messages and outputs verbose logging')
  .option('p', {
    type: 'string',
    alias: 'path',
    describe: 'The path to the configuration file for the contract to watch',
    coerce: p => path.resolve(p),
    demandOption: true,
    requiresArg: true
  })
  .option('v', {
    type: 'boolean',
    alias: 'verbose',
    describe: 'Enable verbose logging'
  })
  .help('h')
  .alias('h', 'help')
  .scriptName('watch-contracts')
  .argv as any;

watcher({
  configPath: argv.path,
  verbose: argv.verbose
});