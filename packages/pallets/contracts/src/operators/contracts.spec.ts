// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  mockPromiseApi,
  testContractAddress,
  testContractBlocks,
  testContractCodeHash,
  testContractEvents,
  testContractExtrinsics,
  testContractMetadata,
} from '@sodazone/ocelloids-sdk-test'

import { Abi } from '@polkadot/api-contract'

import { from } from 'rxjs'

import { mongoFilter, types } from '@sodazone/ocelloids-sdk'

import { contracts } from '../converters/contracts.js'
import { ContractMessageWithTx } from '../types/interfaces.js'
import { contractConstructors, contractEvents, contractMessages } from './contracts.js'

const testContractBlock = testContractBlocks[0]
const blockNumber = testContractBlock.block.header.number
const blockHash = testContractBlock.block.header.hash
const extrinsics = testContractExtrinsics.map((xt, blockPosition) =>
  types.enhanceTxWithIdAndEvents(
    {
      blockNumber,
      blockHash,
      blockPosition,
    },
    xt,
    testContractBlock.events
  )
)

const events = testContractEvents.map(
  (ev, blockPosition) =>
    new types.GenericEventWithId(ev, {
      blockNumber,
      blockHash,
      blockPosition,
    })
)
const instantiateTx = extrinsics[2]
const eventsFromInstantiateTx = events.splice(2, 14)
const testEventsWithIdAndTx = eventsFromInstantiateTx.map((ev) => {
  return new types.GenericEventWithIdAndTx(ev, {
    extrinsic: instantiateTx.extrinsic,
    extrinsicId: instantiateTx.extrinsic.extrinsicId,
    extrinsicPosition: 0,
    ...ev,
  })
})

describe('Wasm contracts operator', () => {
  let testAbi: Abi

  beforeAll(() => {
    testAbi = new Abi(testContractMetadata)
  })

  describe('contractMessages', () => {
    it('should emit decoded contract calls', () => {
      const expectedContractMessages = [
        {
          identifier: 'transfer',
          selector: '0x84a15da1',
        },
        {
          identifier: 'approve',
          selector: '0x681266a0',
        },
      ]
      const testPipe = contractMessages(testAbi, testContractAddress)(from(extrinsics))
      let index = 0

      testPipe.subscribe((result: ContractMessageWithTx) => {
        expect(result.extrinsic.extrinsicId).toBeDefined()
        expect(result.message.identifier).toBe(expectedContractMessages[index].identifier)
        expect(result.message.selector.toPrimitive()).toBe(expectedContractMessages[index].selector)
        index++
      })
    })

    it('should work with array of addresses', () => {
      const found = jest.fn()
      const testPipe = contractMessages(testAbi, [testContractAddress])(from(extrinsics))

      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(2)
        },
      })
    })

    it('should work with mongoFilter', () => {
      const found = jest.fn()
      const testPipe = contractMessages(testAbi, testContractAddress)(from(extrinsics))

      testPipe
        .pipe(
          mongoFilter(
            {
              'args.value': { $bn_gt: 800000000 },
              'message.identifier': 'transfer',
            },
            contracts
          )
        )
        .subscribe({
          next: found,
          complete: () => {
            expect(found).toHaveBeenCalledTimes(1)
          },
        })
    })
  })

  describe('contractConstructors', () => {
    const txWithIdAndEventObs = from(extrinsics.splice(0, 3))

    beforeEach(() => {
      jest.spyOn(mockPromiseApi.query.contracts, 'contractInfoOf').mockResolvedValue({
        isSome: () => true,
        unwrap: () => ({
          codeHash: testContractCodeHash,
        }),
      } as any)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should emit decoded contract constructors', () => {
      const found = jest.fn()

      const testPipe = contractConstructors(mockPromiseApi, testAbi, testContractCodeHash)(txWithIdAndEventObs)

      testPipe.subscribe({
        next: (ctor) => {
          found()
          expect(ctor).toBeDefined()
          expect(ctor.message).toBeDefined()
          expect(ctor.message.identifier).toBe('new')
        },
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1)
        },
      })
    })

    it('should work with mongoFilter', () => {
      const found = jest.fn()

      const testPipe = contractConstructors(mockPromiseApi, testAbi, testContractCodeHash)(txWithIdAndEventObs)

      testPipe
        .pipe(
          mongoFilter(
            {
              'message.identifier': 'new',
            },
            contracts
          )
        )
        .subscribe({
          next: found,
          complete: () => {
            expect(found).toHaveBeenCalledTimes(1)
          },
        })
    })
  })

  describe('contractEvents', () => {
    it('should emit decoded contract events', () => {
      const found = jest.fn()

      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx))

      testPipe.subscribe({
        next: (result) => {
          found()
          expect(result.blockEvent).toBeDefined()
          expect(result.blockEvent.eventId).toBeDefined()
          expect(result.blockEvent.eventId).toBe('2841323-9')
          expect(result.event.identifier).toBe('Transfer')
          expect(result.event.index).toBe(0)
        },
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1)
        },
      })
    })

    it('should work with array of addresses', () => {
      const found = jest.fn()
      const testPipe = contractEvents(testAbi, [testContractAddress])(from(testEventsWithIdAndTx))

      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1)
        },
      })
    })

    it('should work with mongoFilter', () => {
      const found = jest.fn()
      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx))

      testPipe
        .pipe(
          mongoFilter(
            {
              'args.value': { $bn_gt: 800000000 },
              'event.identifier': 'Transfer',
            },
            contracts
          )
        )
        .subscribe({
          next: found,
          complete: () => {
            expect(found).toHaveBeenCalledTimes(1)
          },
        })
    })
  })
})
