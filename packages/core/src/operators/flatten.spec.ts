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
import { of } from 'rxjs';

import type { Event } from '@polkadot/types/interfaces';

import {
  testBlocks,
  testExtrinsics,
  testNestedCalls,
  testNestedExtrinsic,
  testNestedBatchCalls,
  testNestedBatchExtrinsic,
  testDeepNestedCalls,
  testDeepNestedExtrinsic
} from '@sodazone/ocelloids-test';

import { flattenCalls } from './flatten.js';
import { types } from '../index.js';
import { TxWithIdAndEvent } from '../types/interfaces.js';

type NestedCallToMatch = {
  name: string;
  events: Event[];
}
const { number, hash } = testBlocks[0].block.header;

const testNestedTxWithId = types.enhanceTxWithId({
  blockNumber: number,
  blockPosition: 0,
  blockHash: hash
}, testNestedExtrinsic);
const testNestedBatchTxWithId = types.enhanceTxWithId({
  blockNumber: number,
  blockPosition: 0,
  blockHash: hash
}, testNestedBatchExtrinsic);
const testDeepNestedTxWithId = types.enhanceTxWithId({
  blockNumber: number,
  blockPosition: 0,
  blockHash: hash
}, testDeepNestedExtrinsic);
const testNonBatchTxWithId = types.enhanceTxWithId({
  blockNumber: number,
  blockPosition: 0,
  blockHash: hash
}, testExtrinsics[2]);

describe('flatten batch call operator', () => {
  describe('flattenBatch', () => {
    const assertResults = (
      result: TxWithIdAndEvent,
      nestedCalls: NestedCallToMatch[],
      index: number
    ) => {
      expect(result).toBeDefined();

      const { extrinsic: { method }, events } = result;

      const name = `${method.section}.${method.method}`;
      expect(name).toEqual(nestedCalls[index].name);

      events.forEach((e, i) => {
        expect(e.section).toEqual(nestedCalls[index].events[i].section);
        expect(e.method).toEqual(nestedCalls[index].events[i].method);
      });
    };

    it('should flatten nested multisig + proxy extrinsics', done => {
      const testPipe = flattenCalls()(of(testNestedTxWithId));
      let index = 0;

      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testNestedCalls, index);
          index++;
        },
        complete: () => {
          expect(index).toBe(testNestedCalls.length);
          done();
        }
      });
    });

    it('should flatten nested batch extrinsics', done => {
      const testPipe = flattenCalls()(of(testNestedBatchTxWithId));

      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testNestedBatchCalls, index);
          index++;
        },
        complete: () => {
          expect(index).toBe(testNestedBatchCalls.length);
          done();
        }
      });
    });

    it('should flatten deep nested batch + batchAll extrinsics', done => {
      const testPipe = flattenCalls()(of(testDeepNestedTxWithId));

      let index = 0;

      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testDeepNestedCalls, index);
          index++;
        },
        complete: () => {
          expect(index).toBe(testDeepNestedCalls.length);
          done();
        }
      });
    });

    it('should work with non-batched extrinsics', done => {
      let index = 0;
      const testPipe = flattenCalls()(of(testNonBatchTxWithId));
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
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