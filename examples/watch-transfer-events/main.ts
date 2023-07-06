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

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import {
  SubstrateApis,
  finalizedBlocks,
  filterEvents,
  ControlQuery
} from '@sodazone/ocelloids';
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
  .completion()
  .argv as any;

watcher({
  url: argv.url,
  threshold: argv.threshold,
  verbose: argv.verbose
});
