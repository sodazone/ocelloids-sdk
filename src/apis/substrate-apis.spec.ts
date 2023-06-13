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

jest.mock('@polkadot/api', () => {
  const original = jest.requireActual('@polkadot/api');

  return {
    ...original,
    WsProvider: jest.fn(() => {
      return {
        hasSubscriptions: jest.fn(() => {return true;}),
        on: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn()
      }; })
  };
});

jest.mock('@polkadot/util', () => {
  const original = jest.requireActual('@polkadot/util');

  return {
    ...original,
    logger: jest.fn(() => {
      return {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        noop: jest.fn(),
      }; })
  };
});

import { SubstrateApis } from './substrate-apis.js';

describe('substrate APIs', () => {
  let apis: SubstrateApis;

  beforeAll(() => {
    apis = new SubstrateApis({
      providers: {
        polkadot: {
          ws: 'wss://polkadot.local.test'
        },
        rococo: {
          ws: 'wss://rococo.local.test'
        }
      },
    });
  });

  test('instantiate', () => {
    expect(apis).toBeDefined();
    expect(apis.promise).toBeDefined();
    expect(apis.rx).toBeDefined();
    expect(apis.promise.polkadot).toBeDefined();
    expect(apis.rx.polkadot).toBeDefined();
    expect(apis.promise.rococo).toBeDefined();
    expect(apis.rx.rococo).toBeDefined();
  });

  test('disconnect', async () => {
    // Cast as any to access private readonly property
    const polkadotProvider = (apis as any).providers['polkadot'] as any;
    const rococoProvider = (apis as any).providers['rococo'] as any;
    expect(polkadotProvider).toBeDefined();
    expect(rococoProvider).toBeDefined();

    // Call disconnect on all providers
    await apis.disconnect();

    expect(polkadotProvider.disconnect).toBeCalledTimes(1);
    expect(rococoProvider.disconnect).toBeCalledTimes(1);
  });
});
