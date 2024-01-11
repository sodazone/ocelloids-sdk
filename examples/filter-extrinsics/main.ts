#!/usr/bin/env ts-node-esm

/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
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

import { parse } from 'hjson';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { merge, map, Observable } from 'rxjs';

import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  blocks,
  types,
  filterExtrinsics
} from '@sodazone/ocelloids';

function watcher({ urls, verbose }) {
  process.stdin.setEncoding('utf-8');
  process.stdin.on('readable', () => {
    var text = process.stdin.read();
    if (text !== null) {
      const parsed = parse(text);

      if (verbose) {
        console.log('> Endpoints:', urls);
        console.log('> Using filter:', JSON.stringify(parsed, null, 2));
      }

      const conf = {};
      for (let i = 0; i < urls.length; i++) {
        conf[i] = {
          provider: new WsProvider(urls[i])
        };
      }
      const apis = new SubstrateApis(conf);

      const pipes : Observable<types.ExtrinsicWithId>[] = [];
      for (let i = 0; i < urls.length; i++) {
        pipes.push(apis.rx[i].pipe(
          blocks(),
          filterExtrinsics(parsed),
          map((x: any) => ({ network: i, ...x.extrinsic.toHuman() }))
        ));
      }

      merge(...pipes)
        .subscribe(x => console.log(
          JSON.stringify(x)
        ));
    }
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <url> [options]')
  .example('$0 < filters/balances.hjson', 'use balances.hjson filter')
  .example('$0 < filters/balances.hjson | jq .', 'pipe out to jq')
  .option('u', {
    type: 'array',
    alias: 'url',
    default: 'wss://rpc.polkadot.io',
    describe: 'RPC endpoint',
    requiresArg: true,
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'verbose')
  .scriptName('filter-extrinsics')
  .argv as any;

watcher({
  urls: argv.url,
  verbose: argv.verbose
});
