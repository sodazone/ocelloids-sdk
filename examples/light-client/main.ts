#!/usr/bin/env node

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';

import { SubstrateApis, Smoldot, blocks } from '@sodazone/ocelloids-sdk';

function watcher() {
  const provider = new ScProvider(
    Smoldot, Smoldot.WellKnownChain.polkadot
  );

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

