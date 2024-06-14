// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import {
  SubstrateApis,
  finalizedBlocks,
  filterEvents,
  ControlQuery
} from '@sodazone/ocelloids-sdk';
import { tap } from 'rxjs';

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
    verbose ?
      tap((x: SignedBlockExtended) => console.log(
        '> Block Height',
        x.block.header.number.toHuman()
      )) :
      x => x,
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
  .usage('Usage: $0 <url> <threshold> [options]')
  .example('$0 6280000000000', 'watches transfers above amount')
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
  .scriptName('watch-transfer-events')
  .argv as any;

watcher({
  url: argv.url,
  threshold: argv.threshold,
  verbose: argv.verbose
});
