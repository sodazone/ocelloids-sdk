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
    }).toThrowError();
  });

  it('should throw error on missing apis', () => {
    expect(apis.promise.polkadot.isConnected).toBeDefined();
    expect(apis.rx.polkadot.pipe).toBeDefined();

    expect(() => {
      apis.promise.none.isConnected;
    }).toThrowError();
    expect(() => {
      apis.rx.none.pipe();
    }).toThrowError();
  });

  it('should be instantiated', () => {
    expect(apis).toBeDefined();
    expect(apis.promise).toBeDefined();
    expect(apis.rx).toBeDefined();
    expect(apis.promise.polkadot).toBeDefined();
    expect(apis.rx.polkadot).toBeDefined();
    expect(apis.promise.rococo).toBeDefined();
    expect(apis.rx.rococo).toBeDefined();
  });

  it('should trigger the disconnection of all the providers', async () => {
    // Cast as any to access private readonly property
    const polkadotProvider = (apis as any).options['polkadot'].provider as any;
    const rococoProvider = (apis as any).options['rococo'].provider as any;

    expect(polkadotProvider).toBeDefined();
    expect(rococoProvider).toBeDefined();

    // Call disconnect on all providers
    await apis.disconnect();

    expect(polkadotProvider.disconnect).toBeCalledTimes(1);
    expect(rococoProvider.disconnect).toBeCalledTimes(1);
  });
});
