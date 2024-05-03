#!/usr/bin/env node

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import Worker from 'web-worker';
import { isMainThread } from 'node:worker_threads';

import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import { polkadot } from '@substrate/connect-known-chains';

import { SubstrateApis, Smoldot, blocks } from '@sodazone/ocelloids-sdk';

function workerFactory() {
  try {
    //@ts-expect-error constructor
    return new Worker.default(new URL('./worker.mjs', import.meta.url), {
      name: 'oc-smoldot-worker',
      type: 'module'
    })
  } catch (error) {
    return new Worker('./dist/light-client/worker.mjs', {
      name: 'oc-smoldot-worker',
      type: 'module'
    })
  }
}

async function watcher() {
  const provider = new ScProvider(
    Smoldot, polkadot
  );

  await provider.connect({
    embeddedNodeConfig: {
      workerFactory
    }
  })

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

if (isMainThread) {
  watcher().then().catch(console.error);
}

