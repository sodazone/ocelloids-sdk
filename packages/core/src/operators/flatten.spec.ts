// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { of } from 'rxjs'

import { nestedItems, testBlocks } from '@sodazone/ocelloids-sdk-test'
import type { DataToMatch } from '@sodazone/ocelloids-sdk-test'

import { types } from '../index.js'
import { TxWithIdAndEvent } from '../types/interfaces.js'
import { FlattenerMode, flattenCalls } from './flatten.js'

const { number, hash } = testBlocks[0].block.header

describe('flatten call operator', () => {
  describe('flattenCall', () => {
    const assertResults = (result: TxWithIdAndEvent, nestedCalls: DataToMatch[], correlated = true) => {
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

      if (correlated) {
        // Assert that nested call dispatch errors are correlated correctly
        expect(dispatchError?.toHuman()).toEqual(call.dispatchError)

        // Assert that nested call events are correlated correctly
        events.forEach((e, i) => {
          expect(e.section).toEqual(call.events[i].section)
          expect(e.method).toEqual(call.events[i].method)
        })
      }
    }

    it('should flatten nested multisig + proxy extrinsics', (done) => {
      const { extrinsic, events, data } = nestedItems.testMultisigProxy
      const testNestedTxWithId = types.enhanceTxWithIdAndEvents(
        {
          blockNumber: number,
          blockPosition: 2,
          blockHash: hash,
        },
        extrinsic,
        events
      )
      const testPipe = flattenCalls()(of(testNestedTxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should flatten nested batch extrinsics', (done) => {
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
      const testPipe = flattenCalls()(of(testNestedBatchTxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should flatten nested batch extrinsics without correlation', (done) => {
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
      const testPipe = flattenCalls(FlattenerMode.BASIC)(of(testNestedBatchTxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data, false)
          expect(result.events.length).toBe(testNestedBatchTxWithId.events.length)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should flatten force batch extrinsics', (done) => {
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
      const testPipe = flattenCalls()(of(testForceBatchTxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should flatten deep nested batch + batchAll extrinsics', (done) => {
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
      const testPipe = flattenCalls()(of(testDeepNestedTxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should flatten multisig threshold 1 extrinsics', (done) => {
      const { extrinsic, events, data } = nestedItems.testMultisigThreshold1
      const testMultisigThreshold1TxWithId = types.enhanceTxWithIdAndEvents(
        {
          blockNumber: number,
          blockPosition: 2,
          blockHash: hash,
        },
        extrinsic,
        events
      )
      const testPipe = flattenCalls()(of(testMultisigThreshold1TxWithId))

      let c = 0
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          assertResults(result, data)
          c++
        },
        complete: () => {
          expect(c).toBe(data.length)
          done()
        },
      })
    })

    it('should work with batched and non-batched extrinsics', (done) => {
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
      const testPipe = flattenCalls()(of(testNonBatchTxWithId, testDeepNestedTxWithId))

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
    })

    it('should work with non-batched extrinsics', (done) => {
      const testNonBatchTxWithId = types.enhanceTxWithIdAndEvents(
        {
          blockNumber: number,
          blockPosition: 2,
          blockHash: hash,
        },
        testBlocks[0].extrinsics[2],
        testBlocks[0].events
      )
      const testPipe = flattenCalls()(of(testNonBatchTxWithId))

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
    })
  })
})
