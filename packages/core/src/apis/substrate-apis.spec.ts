// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { WsProvider } from '@sodazone/ocelloids-test';

import { SubstrateApis } from './substrate-apis.js';

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider('wss://polkadot.local.test')
  },
  rococo: {
    provider: new WsProvider('wss://rococo.local.test')
  }
});

describe('substrate APIs', () => {
  it('should throw error on missing provider', () => {
    expect(() => {
      const _ = new SubstrateApis({ polkadot: {} });
    }).toThrow();
  });

  it('should be instantiated', () => {
    expect(apis).toBeDefined();
    expect(apis.promise).toBeDefined();
    expect(apis.rx).toBeDefined();
    expect(apis.promise.polkadot).toBeDefined();
    expect(apis.rx.polkadot).toBeDefined();
    expect(apis.promise.rococo).toBeDefined();
    expect(apis.rx.rococo).toBeDefined();
    expect(apis.query).toBeDefined();
    expect(apis.query.rococo).toBeDefined();
    expect(apis.queryMulti).toBeDefined();
    expect(apis.queryMulti.rococo).toBeDefined();
  });

  it('should iterate the registered chain names', async () => {
    expect(apis.chains.length).toBeGreaterThan(0);

    for (const chain of apis.chains) {
      expect(chain).toBeDefined();
    }
  });

  it('should trigger the disconnection of all the providers', async () => {
    // Cast as any to access private readonly property
    const polkadotProvider = (apis as any).options['polkadot'].provider as any;
    const rococoProvider = (apis as any).options['rococo'].provider as any;

    expect(polkadotProvider).toBeDefined();
    expect(rococoProvider).toBeDefined();

    // Call disconnect on all providers
    await apis.disconnect();

    expect(polkadotProvider.disconnect).toHaveBeenCalledTimes(1);
    expect(rococoProvider.disconnect).toHaveBeenCalledTimes(1);
  });
});
