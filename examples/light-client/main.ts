#!/usr/bin/env ts-node-esm

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import * as Sc from '@substrate/connect';

import { SubstrateApis, blocks } from '@sodazone/ocelloids';

function watcher() {
  const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);

  // Smoldot requires to manually connect,
  // the promise is implicitly awaited by the rx pipe
  provider.connect().catch(console.error);

  const apis = new SubstrateApis({
    polkadot: {
      provider
    }
  });

  apis.rx.polkadot.pipe(
    blocks()
  ).subscribe(({
    block: { header: { number, hash } }
  }) => {
    console.log(
      `💡 New block #${number.toBigInt()} has hash ⚡️ ${hash.toHex()}`
    );
  });
}

watcher();

