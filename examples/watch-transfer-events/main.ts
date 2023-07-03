#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  finalizedBlocks,
  filterEvents,
  ControlQuery
} from '@sodazone/ocelloids';

function watcher({ url, threshold, verbose }) {
  if (verbose) {
    console.log('> Endpoint:', url);
    console.log('> Threshold:', threshold);
  }

  const apis = new SubstrateApis({
    network: {
      provider: new WsProvider(url)
    }
  });

  apis.rx.network.pipe(
    finalizedBlocks(),
    filterEvents(ControlQuery.from({
      section: 'balances',
      method: 'Transfer',
      'data.amount': { $bn_gte: threshold }
    }))
  ).subscribe(
    x => console.log(JSON.stringify(x.toHuman()))
  );
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: watch-transfers <url> <threshold> [options]')
  .example('watch-transfers 6280000000000', 'watches transfers above amount')
  .option('t', {
    type: 'string',
    alias: 'threshold',
    default: '2000000000000',
    describe: 'The amount threshold',
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
  threshold: argv.threshold,
  verbose: argv.verbose
});
