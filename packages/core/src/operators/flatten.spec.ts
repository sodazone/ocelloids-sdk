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

import {
  testBlocks,
  testExtrinsics,
  testNestedCalls,
  testNestedExtrinsic,
  testNestedBatchCalls,
  testNestedBatchExtrinsic,
  testForceBatchCalls,
  testForceBatchExtrinsic,
  testDeepNestedCalls,
  testDeepNestedExtrinsic,
  testMultisigThreshold1Calls,
  testMultisigThreshold1Extrinsic
} from '@sodazone/ocelloids-test';
import type { NestedCallToMatch } from '@sodazone/ocelloids-test';

import { flattenCalls } from './flatten.js';
import { types } from '../index.js';
import { TxWithIdAndEvent } from '../types/interfaces.js';

const { number, hash } = testBlocks[0].block.header;

describe('flatten call operator', () => {
  describe('flattenCall', () => {
    const assertResults = (
      result: TxWithIdAndEvent,
      nestedCalls: NestedCallToMatch[],
      index: number
    ) => {
      expect(result).toBeDefined();

      const { extrinsic: { method, origins }, events, dispatchError } = result;

      // Assert that nested calls are extracted correctly
      const name = `${method.section}.${method.method}`;
      expect(name).toEqual(nestedCalls[index].name);

      // Assert that nested call dispatch errors are correlated correctly
      expect(dispatchError?.toHuman()).toEqual(nestedCalls[index].dispatchError);

      // Assert that nested call origins are extracted correctly
      origins.forEach((o, i) => {
        expect(o.type).toEqual(nestedCalls[index].origins[i].type);
        expect(o.address.toString()).toEqual(nestedCalls[index].origins[i].address);
      });

      // Assert that nested call events are correlated correctly
      events.forEach((e, i) => {
        expect(e.section).toEqual(nestedCalls[index].events[i].section);
        expect(e.method).toEqual(nestedCalls[index].events[i].method);
      });
    };

    it('should flatten nested multisig + proxy extrinsics', done => {
      const testNestedTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testNestedExtrinsic);
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
      const testNestedBatchTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testNestedBatchExtrinsic);
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

    it('should flatten force batch extrinsics', done => {
      const testForceBatchTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testForceBatchExtrinsic);
      const testPipe = flattenCalls()(of(testForceBatchTxWithId));

      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testForceBatchCalls, index);
          index++;
        },
        complete: () => {
          expect(index).toBe(testForceBatchCalls.length);
          done();
        }
      });
    });

    it('should flatten deep nested batch + batchAll extrinsics', done => {
      const testDeepNestedTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testDeepNestedExtrinsic);
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

    it('should flatten multisig threshold 1 extrinsics', done => {
      const testMultisigThreshold1TxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testMultisigThreshold1Extrinsic);
      const testPipe = flattenCalls()(of(testMultisigThreshold1TxWithId));
      let index = 0;

      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testMultisigThreshold1Calls, index);
          index++;
        },
        complete: () => {
          expect(index).toBe(testMultisigThreshold1Calls.length);
          done();
        }
      });
    });

    it('should work with non-batched extrinsics', done => {
      const testNonBatchTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testExtrinsics[2]);
      const testPipe = flattenCalls()(of(testNonBatchTxWithId));

      let index = 0;

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