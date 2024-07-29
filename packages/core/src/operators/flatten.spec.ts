// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { of } from 'rxjs'

import { cloneExtrinsic, nestedItems, testBlocks } from '@sodazone/ocelloids-sdk-test'
import type { DataToMatch } from '@sodazone/ocelloids-sdk-test'

import { types } from '../index.js'
import { TxWithIdAndEvent } from '../types/interfaces.js'
import { FlattenerMode, flattenCalls } from './flatten.js'

const { number, hash } = testBlocks[0].block.header

describe('flatten call operator', () => {
  describe('flattenCall', () => {
    const assertResults = (result: TxWithIdAndEvent, nestedCalls: DataToMatch[], mode = FlattenerMode.CORRELATED) => {
      expect(result).toBeDefined()

      const {
        levelId,
        extrinsic: { method, extraSigners },
        events,
        dispatchError,
      } = result

      expect(levelId).toBeDefined()

      const call = nestedCalls.find((c) => c.levelId === levelId)!

      // Assert that nested calls are extracted correctly
      const name = `${method.section}.${method.method}`
      expect(name).toEqual(call.name)

      // Assert that nested call origins are extracted correctly
      extraSigners.forEach((o, i) => {
        expect(o.type).toEqual(call.extraSigners[i].type)
        expect(o.address.toString()).toEqual(call.extraSigners[i].address)
      })

      if (mode === FlattenerMode.CORRELATED) {
        // Assert that nested call dispatch errors are correlated correctly
        expect(dispatchError?.toHuman()).toEqual(call.dispatchError)

        // Assert that nested call events are correlated correctly
        events.forEach((e, i) => {
          expect(e.section).toEqual(call.events[i].section)
          expect(e.method).toEqual(call.events[i].method)
        })
      }
    }

    function testDeepNested(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testDeepNested
        const testDeepNestedTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          extrinsic,
          events
        )
        const testPipe = flattenCalls(mode)(of(testDeepNestedTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            assertResults(result, data, mode)
            c++
          },
          complete: () => {
            expect(c).toBe(data.length)
            done()
          },
        })
      }
    }

    function testForceBatch(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testForceBatch
        const testForceBatchTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          extrinsic,
          events
        )
        const testPipe = flattenCalls(mode)(of(testForceBatchTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            assertResults(result, data, mode)
            c++
          },
          complete: () => {
            expect(c).toBe(data.length)
            done()
          },
        })
      }
    }

    function testNestedMultisigAndProxy(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testMultisigProxy
        const testNestedTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          { ...extrinsic, extrinsic: cloneExtrinsic(extrinsic.extrinsic) },
          events
        )
        const testPipe = flattenCalls(mode)(of(testNestedTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            assertResults(result, data, mode)
            c++
          },
          complete: () => {
            expect(c).toBe(data.length)
            done()
          },
        })
      }
    }

    function testNestedBatch(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testBatch
        const testNestedBatchTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          extrinsic,
          events
        )
        const testPipe = flattenCalls(mode)(of(testNestedBatchTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            assertResults(result, data, mode)
            c++
          },
          complete: () => {
            expect(c).toBe(data.length)
            done()
          },
        })
      }
    }

    function testMixedBatched(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testDeepNested
        const testDeepNestedTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          extrinsic,
          events
        )
        const testNonBatchTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          testBlocks[0].extrinsics[2],
          testBlocks[0].events
        )
        const testPipe = flattenCalls(mode)(of(testNonBatchTxWithId, testDeepNestedTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            c++
            expect(result).toBeDefined()
          },
          complete: () => {
            expect(c).toBe(data.length + 1)
            done()
          },
        })
      }
    }

    function testNonBatched(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const testNonBatchTxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          testBlocks[0].extrinsics[2],
          testBlocks[0].events
        )
        const testPipe = flattenCalls(mode)(of(testNonBatchTxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            c++
            expect(result).toBeDefined()
            expect(result.extrinsic.signer.toHuman()).toEqual({ Id: '1sa85enM8EQ56Tzfyg97kvQf1CYfPoTczin4ASYTwUdH9iK' })
            expect(result.extrinsic.method.toHuman()).toEqual({
              args: {
                dest: { Id: '16hp43x8DUZtU8L3cJy9Z8JMwTzuu8ZZRWqDZnpMhp464oEd' },
                value: '733,682,465,000',
              },
              method: 'transferKeepAlive',
              section: 'balances',
            })
          },
          complete: () => {
            expect(c).toBe(1)
            done()
          },
        })
      }
    }

    function testThreshold1(mode = FlattenerMode.CORRELATED) {
      return (done) => {
        const { extrinsic, events, data } = nestedItems.testMultisigThreshold1
        const testMultisigThreshold1TxWithId = types.enhanceTxWithIdAndEvents(
          {
            blockNumber: number,
            blockPosition: 2,
            blockHash: hash,
          },
          { ...extrinsic, extrinsic: cloneExtrinsic(extrinsic.extrinsic) },
          events
        )
        const testPipe = flattenCalls(mode)(of(testMultisigThreshold1TxWithId))

        let c = 0
        testPipe.subscribe({
          next: (result: TxWithIdAndEvent) => {
            assertResults(result, data, mode)
            c++
          },
          complete: () => {
            expect(c).toBe(data.length)
            done()
          },
        })
      }
    }

    it('should flatten nested multisig + proxy extrinsics', testNestedMultisigAndProxy())

    it(
      'should flatten nested multisig + proxy extrinsics without correlation',
      testNestedMultisigAndProxy(FlattenerMode.BASIC)
    )

    it('should flatten nested batch extrinsics', testNestedBatch())

    it('should flatten nested batch extrinsics without correlation', testNestedBatch(FlattenerMode.BASIC))

    it('should flatten force batch extrinsics', testForceBatch())

    it('should flatten force batch extrinsics without correlation', testForceBatch(FlattenerMode.BASIC))

    it('should flatten deep nested batch + batchAll extrinsics', testDeepNested())

    it(
      'should flatten deep nested batch + batchAll extrinsics without correlation',
      testDeepNested(FlattenerMode.BASIC)
    )

    it('should flatten multisig threshold 1 extrinsics', testThreshold1())

    it('should flatten multisig threshold 1 extrinsics without correlation', testThreshold1(FlattenerMode.BASIC))

    it('should work with batched and non-batched extrinsics', testMixedBatched())

    it('should work with batched and non-batched extrinsics without correlation', testMixedBatched(FlattenerMode.BASIC))

    it('should work with non-batched extrinsics', testNonBatched())

    it('should work with non-batched extrinsics without correlation', testNonBatched(FlattenerMode.BASIC))
  })
})
