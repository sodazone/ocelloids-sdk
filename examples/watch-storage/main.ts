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

import {
  SubstrateApis,
  mongoFilter,
  config
} from '@sodazone/ocelloids';
import { switchMap } from 'rxjs';

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider(
      config.networks.polkadot
    )
  }
});

apis.query.polkadot.pipe(
  switchMap(q => q.timestamp.now())
).subscribe(x => {
  console.log('Timestamp:', new Date(x.toPrimitive() as number));
});

apis.query.polkadot.pipe(
  switchMap(q => q.system.account(
    '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5'
  )),
  mongoFilter({
    'data.free': { $bn_lt: '1006038009840776279' }
  })
).subscribe(x => console.log('Account Balance:', x.toHuman()));

