#!/usr/bin/env node

import { parse } from 'hjson';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { merge, map, Observable } from 'rxjs';

import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  blocks,
  mongoFilterFrom,
  extractExtrinsics,
  types
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
          extractExtrinsics(),
          mongoFilterFrom(parsed),
          map((x: any) => ({ network: i, ...x.toHuman() }))
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
  .usage('Usage: filter-xt <url> [options]')
  .example('filter-xt < filters/balances.hjson', 'use balances.hjson filter')
  .example('filter-xt < filters/balances.hjson | jq .', 'pipe out to jq')
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
  .argv as any;

watcher({
  urls: argv.url,
  verbose: argv.verbose
});
