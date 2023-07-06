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

import { exit } from 'node:process';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import { BN, formatBalance } from '@polkadot/util';

import {
  bufferCount, last, map, max, merge, min, scan, tap
} from 'rxjs';

import {
  SubstrateApis,
  blocksInRange,
  converters,
  filterEvents
} from '@sodazone/ocelloids';

function initFromChainInfo(apiPromise, verbose) {
  apiPromise.isReady.then(api => {
    const chainInfo = api.registry.getChainProperties();
    if (chainInfo === undefined) {
      throw new Error('Unable to retrieve chain info');
    }
    const { tokenDecimals, tokenSymbol } = chainInfo;

    if (verbose) {
      console.log('> Chain Decimals:', tokenDecimals.toHuman());
      console.log('> Chain Symbol:', tokenSymbol.toHuman());
    }

    formatBalance.setDefaults({
      decimals: tokenDecimals.unwrapOrDefault().toArray().map(v => v.toNumber()),
      unit: tokenSymbol.unwrapOrDefault().toArray().map(v => v.toString())
    });
  });
}

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

  initFromChainInfo(apis.promise.network, verbose);

  type FeeInfo = {
    extrinsicId: string,
    blockNumber: number,
    fee: BN
  }

  let extrinsicsCount = 0;
  let eventsCount = 0;

  const feesPipe = apis.rx.network.pipe(
    blocksInRange(blockHeight, blockCount, false),
    tap(b => {
      extrinsicsCount += b.extrinsics.length;
      eventsCount += b.events.length;
    }),
    filterEvents({
      section: 'transactionPayment',
      method: 'TransactionFeePaid'
    }),
    map(x => {
      const { extrinsicId, blockNumber } = x;
      const fee = new BN(
        (converters.base.toNamedPrimitive(x) as any).data.actualFee
      );
      return {
        extrinsicId,
        blockNumber: blockNumber.toPrimitive(),
        fee
      } as FeeInfo;
    })
  );

  function reducer(
    { sum, index }: {sum: BN, index: number},
    nextFee: FeeInfo
  ) {
    return {
      average: sum.add(nextFee.fee).divn(index + 1),
      sum: sum.add(nextFee.fee),
      index: index + 1,
    };
  }

  function formatFeeInfo(info: FeeInfo): string {
    return `${formatBalance(info.fee)} (@${info.extrinsicId})`;
  }

  const start = Date.now();

  merge(
    feesPipe.pipe(
      scan(reducer, {
        average: new BN(0), sum: new BN(0), index: 0
      }),
      map(({ average }) => average),
      last()
    ),
    feesPipe.pipe(
      min((x, y) => x.fee.cmp(y.fee))
    ),
    feesPipe.pipe(
      max((x, y) => x.fee.cmp(y.fee))
    )
  ).pipe(bufferCount(3)).subscribe({
    next: ([avgFee, minFee, maxFee]) => {
      const t = Date.now() - start;
      const bh = parseInt(blockHeight);
      const bc = parseInt(blockCount);
      const bt = t / bc;

      console.log(`Fees [${bh}-${bh + bc}]`);
      console.log('='.repeat(40));
      console.log('Average:', formatBalance(avgFee as BN));
      console.log('Minimum:', formatFeeInfo(minFee as FeeInfo));
      console.log('Maximum:', formatFeeInfo(maxFee as FeeInfo));
      console.log('-'.repeat(40));
      console.log(`Time: ${t}ms (${bt} block/s)`);
      console.log(`Blocks: ${bc} (tx: ${extrinsicsCount}, events: ${eventsCount})`);
    },
    error: console.error,
    complete: () => exit(0)
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: simple-fees <url> <block height> <block count> [options]')
  .example('simple-fees', 'calculates simple fee stats for a block range')
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
