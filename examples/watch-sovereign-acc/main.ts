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

import { WsProvider } from '@polkadot/api';
import { BN, formatBalance } from '@polkadot/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types-codec';

import { SubstrateApis } from '@sodazone/ocelloids';

import { switchMap, combineLatest, filter, map, timer } from 'rxjs';

import { blue, green, setTokenDefaultsFromChainInfo, red } from '../common/index.js';

// Moonbeam sovereign account on Astar
const SOVEREIGN_ACC = 'YYd75rPbqhhtAT826DJWF5PnpaDLQofq8sJTtReQofbwVwm';

// xcASTR asset ID on Moonbeam
const ASSET_ID = new BN('224077081838586484055667086558292981199');

const apis = new SubstrateApis({
  astar: {
    noInitWarn: true,
    provider: new WsProvider(
      'wss://rpc.astar.network'
    )
  },
  moonbeam: {
    noInitWarn: true,
    provider: new WsProvider(
      'wss://moonbeam.public.blastapi.io'
    )
  }
});

setTokenDefaultsFromChainInfo(apis.promise.astar);

const sovereignAccBalance = apis.query.astar.pipe(
  switchMap(q => q.system.account(SOVEREIGN_ACC))
);

const xcAsset = apis.query.moonbeam.pipe(
  switchMap(q => combineLatest([q.assets.asset(ASSET_ID), q.assets.metadata(ASSET_ID)])),
  filter(([asset, _]) => (asset as Option<any>).isSome),
  map(([asset, metadata]) => ({
    details: (asset as Option<any>).unwrap(),
    metadata
  }))
);

// Here we are simply checking the balances on both chains every minute and logging the status.
// It would probably make more sense to send to OpenTelemetry,
// which can be used in Prometheus or other tools for visualization and alerting.
timer(0, 60000).pipe(
  switchMap(_ => combineLatest([sovereignAccBalance, xcAsset]))
).subscribe(([acc, asset]) => {
  const balance = (acc as AccountInfo).data.free.toBn();
  const assetSupply = asset.details.supply.toBn();
  const assetFormat = {
    decimals: (asset.metadata as any).decimals.toNumber(),
    withUnit: (asset.metadata as any).symbol.toHuman()
  };
  const diff = (balance.sub(assetSupply)).abs();

  console.log('-'.repeat(80));
  if (balance >= assetSupply) {
    console.log('👍 ASTR balance in sovereign account is above xcASTR supply on Moonbeam');
    console.log('> Difference              :',
      (diff.div(balance)).toNumber() > 0.01 ? blue('+' + formatBalance(diff)) : green('+' + formatBalance(diff))
    );
  } else {
    console.warn('🚨 ASTR balance in sovereign account has fallen below xcASTR supply in Moonbeam 🚨');
    console.log('> Difference              :',
      (diff.div(assetSupply)).toNumber() > 0.01 ? red('-' + formatBalance(diff)) : blue('-' + formatBalance(diff))
    );
  }
  console.log('> Soverign account balance:', formatBalance(balance));
  console.log('> Asset supply            :', formatBalance(assetSupply, assetFormat));
  console.log('> Timestamp               :', new Date().toISOString());
});