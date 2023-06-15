/* istanbul ignore file */

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

import { from, of } from 'rxjs';

import { ApiRx } from '@polkadot/api';
import { DeriveApi, SignedBlockExtended } from '@polkadot/api-derive/types';
import { AnyNumber } from '@polkadot/types-codec/types';

// Nested packages cannot be mocked by other means.
// @see https://github.com/jestjs/jest/issues/462
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

export function mockPolkadotApi({
  testBlocks
} : {
  testBlocks?: SignedBlockExtended[]
} = {}) {
  const mockDeriveApi = {
    derive: {
      chain: {
        getBlockByNumber: (blockNumber: AnyNumber) => of(
          testBlocks?.find(
            b => b.block.header.number.toNumber() === blockNumber
          )
        ),
      }
    }
  } as unknown as DeriveApi;

  const mockRxApi = {
    isReady: from<Promise<ApiRx>>(
      new Promise((resolve): void => {
        resolve(mockDeriveApi as unknown as ApiRx);
      })
    ),
  } as unknown as ApiRx;

  jest.mock('@polkadot/api', () => {
    const original = jest.requireActual('@polkadot/api');

    return {
      ...original,
      ApiRx: jest.fn(() => mockRxApi),
      WsProvider: jest.fn(() => {
        return {
          hasSubscriptions: jest.fn(() => {
            return true;
          }),
          on: jest.fn(),
          connect: jest.fn(),
          disconnect: jest.fn(),
          send: jest.fn(),
          subscribe: jest.fn(),
          unsubscribe: jest.fn()
        }; })
    };
  });
}
