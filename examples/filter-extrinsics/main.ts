// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

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
} from '@sodazone/ocelloids-sdk';

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
