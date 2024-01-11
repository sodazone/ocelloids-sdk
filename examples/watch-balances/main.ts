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

import { WsProvider } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { formatBalance } from '@polkadot/util';

import {
  SubstrateApis,
  config
} from '@sodazone/ocelloids';
import {
  bufferCount, merge, map, switchMap, mergeAll
} from 'rxjs';

import { blue, setTokenDefaultsFromChainInfo, red } from '../common/index.js';

const ADDRESSES = {
  '12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW': 'Kraken',
  '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7': 'Binance',
  '16hp43x8DUZtU8L3cJy9Z8JMwTzuu8ZZRWqDZnpMhp464oEd': 'OKX',
  '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX': 'Huobi',
  '12P4Y3hV6r2D7A7saeC9JVfjVpxA757AeDJrGT7u9T6t6KwR': 'Coinbase',
  '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5': 'Kucoin',
  '15YVfxAkATndVv35pYj3dSUeqXHVPMSZ2g79JaPR4WWTEhPF': 'Poloniex',
  '14hyogTZNqGwpNhUNSXgyVQSPETkktK9cnUFto98vdBbgR7Q': 'Nexo',
  '16Xuv8TZpqSP9iSxquSJ9CQDfnJink7tFFNg8YYLqE5DiXkn': 'MEXC',
  '12nr7GiDrYHzAYT9L8HdeXnMfWcBuYfAXpgfzf3upujeCciz': 'ByBit',
  '12T1tgaYZzEkFpnPvyqttmPRJxbGbR4uDx49cvZR5SRF8QDu': 'Bitfinex',
  '15u2N1pqWr56teREjQTP5M3tk1SPQjEoUAV6jFfcQCoVy3S5': 'Bitget',
  '14GHi1hWWef7y6BSdDjhKgoZeA56FwcHTdGRaMuiFX5w2rYP': 'OkCoin',
  '14AMy7J61P7BfyRMdCh1L9Wp31GLCcqrWaeidqLZTheeuNSp': 'Bittrex',
  '133SDz9BYXmVzbo7DXtXzhbUDsHLf2pY76U29m93Htm2mE8x': 'Unknown #1',
  '13sc83poXh93CXtzNjaCwo2Q88cS9oNyJ6Ru7DyxchqKVbbc': 'Unknown #2',
  '13MLdtCJdSbyojwjiBMxti4tQ7qVZN2XgNfGcfSDck84tFnd': 'Unknown #3'
};

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider(
      config.networks.polkadot
    )
  }
});

setTokenDefaultsFromChainInfo(apis.promise.polkadot);

function trackIO(address: string) {
  return apis.query.polkadot.pipe(
    switchMap(q => q.system.account(address)),
    bufferCount(2,1),
    map(([x, y]) => ([{
      address,
      balance: (x as AccountInfo).data
    },{
      address,
      balance: (y as AccountInfo).data
    }]))
  );
}

merge(Object.keys(ADDRESSES).map(trackIO))
  .pipe(mergeAll())
  .subscribe(([prev, curr]) => {
    console.log('*'.repeat(80));
    console.log(ADDRESSES[curr.address], 'wallet 🌶️');
    console.log('-'.repeat(80));
    console.log('Time   :', new Date().toISOString());
    console.log('Address:', curr.address);

    const cb = curr.balance.free.toBn();
    const diff = cb.sub(prev.balance.free.toBn());
    console.log('Balance:', formatBalance(cb));
    console.log('Delta  :',
      diff.isNeg() ?
        red(formatBalance(diff)) :
        blue('+' + formatBalance(diff))
    );
  });

console.log(`👀 Watching ${Object.keys(ADDRESSES).length} balances...`);