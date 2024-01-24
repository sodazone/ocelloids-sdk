// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

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
      nestedCalls: NestedCallToMatch[]
    ) => {
      expect(result).toBeDefined();

      const { levelId, extrinsic: { method, origins }, events, dispatchError } = result;

      expect(levelId).toBeDefined();

      const call = nestedCalls.find(c => c.levelId === levelId)!;

      // Assert that nested calls are extracted correctly
      const name = `${method.section}.${method.method}`;
      expect(name).toEqual(call.name);

      // Assert that nested call dispatch errors are correlated correctly
      expect(dispatchError?.toHuman()).toEqual(call.dispatchError);

      // Assert that nested call origins are extracted correctly
      origins.forEach((o, i) => {
        expect(o.type).toEqual(call.origins[i].type);
        expect(o.address.toString()).toEqual(call.origins[i].address);
      });

      // Assert that nested call events are correlated correctly
      events.forEach((e, i) => {
        expect(e.section).toEqual(call.events[i].section);
        expect(e.method).toEqual(call.events[i].method);
      });
    };

    it('should flatten nested multisig + proxy extrinsics', done => {
      const testNestedTxWithId = types.enhanceTxWithId({
        blockNumber: number,
        blockPosition: 0,
        blockHash: hash
      }, testNestedExtrinsic);
      const testPipe = flattenCalls()(of(testNestedTxWithId));

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testNestedCalls);
          c++;
        },
        complete: () => {
          expect(c).toBe(testNestedCalls.length);
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

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testNestedBatchCalls);
          c++;
        },
        complete: () => {
          expect(c).toBe(testNestedBatchCalls.length);
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

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testForceBatchCalls);
          c++;
        },
        complete: () => {
          expect(c).toBe(testForceBatchCalls.length);
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

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testDeepNestedCalls);
          c++;
        },
        complete: () => {
          expect(c).toBe(testDeepNestedCalls.length);
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

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, testMultisigThreshold1Calls);
          c++;
        },
        complete: () => {
          expect(c).toBe(testMultisigThreshold1Calls.length);
          done();
        }
      });
    });

    it('should work with batched and non-batched extrinsics', done => {
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
      const testPipe = flattenCalls()(of(testNonBatchTxWithId, testDeepNestedTxWithId));

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          c++;
          expect(result).toBeDefined();
        },
        complete: () => {
          expect(c).toBe(testDeepNestedCalls.length + 1);
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

      let c = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          c++;
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
          expect(c).toBe(1);
          done();
        }
      });
    });
  });
});