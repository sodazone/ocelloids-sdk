#!/usr/bin/env ts-node-esm

/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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