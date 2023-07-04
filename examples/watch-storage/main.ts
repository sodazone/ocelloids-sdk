#!/usr/bin/env ts-node-esm

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
  console.log('Timestamp:', new Date(x.toPrimitive()));
});

apis.query.polkadot.pipe(
  switchMap(q => q.system.account(
    '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5'
  )),
  mongoFilter({
    'data.free': { $bn_lt: '1006038009840776279' }
  })
).subscribe(x => console.log('Account Balance:', x.toHuman()));

