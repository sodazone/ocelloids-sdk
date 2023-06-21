#!/usr/bin/env ts-node-esm

import { parse } from 'hjson';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  blocks,
  mongoFilterFrom,
  extractExtrinsics
} from '@sodazone/ocelloids';

function watcher({ endpoint, verbose }) {
  process.stdin.setEncoding('utf-8');
  process.stdin.on('readable', () => {
    var text = process.stdin.read();
    if (text !== null) {
      const parsed = parse(text);

      if (verbose) {
        console.log('> Endpoint:', endpoint);
        console.log('> Using filter:', JSON.stringify(parsed, null, 2));
      }

      const apis = new SubstrateApis(
        {
          polkadot: {
            provider: new WsProvider(endpoint)
          }
        }
      );
      apis.rx.polkadot.pipe(
        blocks(),
        extractExtrinsics(),
        mongoFilterFrom(parsed)
      ).subscribe(x => console.log(
        JSON.stringify(
          x.toHuman()
        )
      ));
    }
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: xtwatch <url> [options]')
  .example('xtwatch < filters/balances.hjson', 'use balances.hjson filter')
  .example('xtwatch < filters/balances.hjson | jq .', 'pipe out to jq')
  .default('u', 'wss://rpc.polkadot.io')
  .alias('u', 'url')
  .nargs('u', 1)
  .describe('u', 'RPC endpoint')
  .demandOption(['u'])
  .help('h')
  .alias('h', 'help')
  .alias('v', 'verbose')
  .argv as any;

watcher({
  endpoint: argv.url,
  verbose: argv.verbose
});
