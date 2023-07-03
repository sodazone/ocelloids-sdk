#!/usr/bin/env ts-node-esm

import { exit } from 'node:process';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  blocksInRange,
  filterEvents
} from '@sodazone/ocelloids';

function watcher({ url, blockHeight, blockCount, verbose }) {
  if (verbose) {
    console.log('> Endpoint:', url);
    console.log('> Block Height:', blockHeight);
    console.log('> Block Count:', blockCount);
  }

  const apis = new SubstrateApis({
    network: {
      provider: new WsProvider(url)
    }
  });

  apis.rx.network.pipe(
    blocksInRange(blockHeight, blockCount, false),
    filterEvents({
      section: 'balances',
      method: { $in: ['Withdraw', 'Deposit']}
    })
  ).subscribe({
    next: x => console.log(x.toHuman()),
    complete: () => exit(0)
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: filter-fees <url> <block height> <block count> [options]')
  .example('filter-fees', 'filters balance fee events for a block range')
  .option('b', {
    type: 'string',
    alias: 'block-height',
    default: '16134439',
    describe: 'The block height to start',
    requiresArg: true
  })
  .option('c', {
    type: 'string',
    alias: 'block-count',
    default: '100',
    describe: 'The number of blocks to fetch',
    requiresArg: true
  })
  .option('u', {
    type: 'string',
    alias: 'url',
    default: 'wss://rpc.polkadot.io',
    describe: 'The RPC endpoint',
    requiresArg: true,
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'verbose')
  .argv as any;

watcher({
  url: argv.url,
  blockHeight: argv.blockHeight,
  blockCount: argv.blockCount,
  verbose: argv.verbose
});
