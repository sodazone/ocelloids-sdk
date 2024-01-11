/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
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

import type { TxWithEvent } from '@polkadot/api-derive/types';

import { of } from 'rxjs';

import {
  testBlocks,
  testExtrinsics,
  testBatchExtrinsic,
  testBatchCalls
} from '@sodazone/ocelloids-test';

import { flattenBatch } from './flatten.js';
import { types } from '../index.js';

const blockNumber = testBlocks[0].block.header.number;
const testBatchTxWithId = types.enhanceTxWithId({
  blockNumber,
  blockPosition: 0
}, testBatchExtrinsic);
const testNonBatchTxWithId = types.enhanceTxWithId({
  blockNumber,
  blockPosition: 0
}, testExtrinsics[2]);

describe('flatten batch call operator', () => {
  describe('flattenBatch', () => {
    it('should flatten `utility.batchAll` extrinsics', done => {
      const testPipe = flattenBatch()(of(testBatchTxWithId));
      let index = 0;

      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.signer.toJSON()).toEqual({ 'id': '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7' });

          // The first result should be the actual batch call
          // After that, the emitted extrinsics should be of the flattened calls
          if (index === 0) {
            expect(result.extrinsic.method.section).toBe('utility');
            expect(result.extrinsic.method.method).toBe('batchAll');
          } else {
            expect(result.extrinsic.method.toHuman()).toEqual(testBatchCalls[index - 1].toHuman());
          }

          index++;
        },
        complete: () => {
          expect(index).toBe(7);
          done();
        }
      });
    });

    it('should work with non-batched extrinsics', done => {
      let index = 0;
      const testPipe = flattenBatch()(of(testNonBatchTxWithId));
      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          index++;
          expect(result).toBeDefined();
          expect(result.extrinsic.signer.toHuman()).toEqual({ Id: '1sa85enM8EQ56Tzfyg97kvQf1CYfPoTczin4ASYTwUdH9iK' });
          expect(result.extrinsic.method.toHuman()).toEqual({
            args: {
              dest: { Id: '16hp43x8DUZtU8L3cJy9Z8JMwTzuu8ZZRWqDZnpMhp464oEd' },
              value: '733,682,465,000'
            },
            method: 'transferKeepAlive',
            section: 'balances'
          });
        },
        complete: () => {
          expect(index).toBe(1);
          done();
        }
      });
    });
  });
});