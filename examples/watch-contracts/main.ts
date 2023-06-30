#!/usr/bin/env ts-node-esm

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exit } from 'node:process';

import { parse } from 'hjson';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocksInRange,
  blocks
} from '@sodazone/ocelloids';

import {
  filterContractCalls,
  converters
} from '@sodazone/ocelloids-contracts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHeader(text, char, length) {
  const sep = `> ${char.repeat(length)}`;
  console.log(sep);
  console.log(text);
  console.log(sep);
}

function objectToStructuredString(data, level = 0): string {
  if (data === undefined || data === null) {
    return 'null';
  }
  if (typeof data === 'string' || Object.keys(data).length === 0) {
    return data;
  }
  return Object.keys(data).map(k => `\n>${' '.repeat(level * 2)} - ${k}: ${objectToStructuredString(data[k], level + 1)}`).join('');
}

function watcher({ configPath, verbose }) {
  const c = readFileSync(path.resolve(__dirname, configPath)).toString();
  const config = parse(c);

  if (config.getBlocksInRange && (config.startBlock === undefined || config.range === undefined)) {
    throw new Error('startBlock and range needs to be configured when getBlockInRange is set to true.');
  }

  const apis = new SubstrateApis({
    network: {
      ...config.apiOptions,
      provider: new WsProvider(config.network)
    }
  });

  if (verbose) {
    console.log('> Contract address:', config.address);
    console.log('> Network:', config.network);
    console.log(
      config.getBlocksInRange ?
        `> Scanning blocks from ${config.startBlock} to ${config.startBlock + config.range}` :
        '> Scanning new blocks'
    );
  }

  const contractMetadataJson = readFileSync((path.resolve(__dirname, configPath, '../', config.metadata))).toString();

  const abi = new Abi(contractMetadataJson);

  apis.rx.network.pipe(
    config.getBlocksInRange ?
      blocksInRange(config.startBlock, config.range, false) :
      blocks({
        finalized: false,
        debug: verbose ? true : false
      }),
    filterContractCalls(
      abi,
      config.address,
      config.filter
    )
  ).subscribe({
    next: x => {
      if (verbose) {
        const call = converters.contracts.toNamedPrimitive(x);
        printHeader('> 💬 Contract Message', '=', 60);
        console.log('> Identifier:', x.message.identifier);
        console.log('> Arguments:', objectToStructuredString(call.args));
        console.log('> JSON:');
      }
      console.log(JSON.stringify({
        ...x,
        extrinsic: x.extrinsic.toHuman(),
        events: x.events.map(ev => ev.toHuman())
      }));
    },
    complete: () => {
      if (verbose) {
        printHeader('> 🙌 Scan complete', '=', 60);
      }
      exit(0);
    }
  });
}

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

