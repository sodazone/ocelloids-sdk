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

import {
  mockPromiseApi,
  testContractMetadata,
  testContractAddress,
  testContractExtrinsics,
  testContractBlocks,
  testContractEvents,
  testContractCodeHash
} from '@sodazone/ocelloids-test';

import { Abi } from '@polkadot/api-contract';

import { from } from 'rxjs';

import { types, mongoFilter } from '@sodazone/ocelloids';

import { contractConstructors, contractEvents, contractMessages } from './contracts.js';
import { ContractMessageWithTx } from '../types/interfaces.js';
import { contracts } from '../converters/contracts.js';

const blockNumber = testContractBlocks[0].block.header.number;
const extrinsics = testContractExtrinsics.map(
  (xt, blockPosition) => types.enhanceTxWithId(
    {
      blockNumber,
      blockPosition
    },
    xt
  )
);

const extrinsicId = `${blockNumber.toString()}-0`;
const events = testContractEvents.map((ev, blockPosition) => new types.GenericEventWithId(ev, {
  blockNumber,
  extrinsicPosition: blockPosition,
  extrinsicId
}));
const instantiateTx = extrinsics[2];
const eventsFromInstantiateTx = events.splice(2, 14);
const testEventsWithIdAndTx = eventsFromInstantiateTx.map(ev => {
  (ev as types.EventWithIdAndTx).extrinsic = instantiateTx.extrinsic;
  return ev as types.EventWithIdAndTx;
});

describe('Wasm contracts operator', () => {
  let testAbi: Abi;

  beforeAll(() => {
    testAbi = new Abi(testContractMetadata);
  });

  describe('contractMessages', () => {
    it('should emit decoded contract calls', () => {
      const expectedContractMessages = [
        {
          identifier: 'transfer',
          selector: '0x84a15da1'
        },
        {
          identifier: 'approve',
          selector: '0x681266a0'
        }
      ];
      const testPipe = contractMessages(testAbi, testContractAddress)(from(extrinsics));
      let index = 0;

      testPipe.subscribe((result: ContractMessageWithTx) => {
        expect(result.extrinsic.extrinsicId).toBeDefined();
        expect(result.message.identifier).toBe(expectedContractMessages[index].identifier);
        expect(result.message.selector.toPrimitive()).toBe(expectedContractMessages[index].selector);
        index++;
      });
    });

    it('should work with array of addresses', () => {
      const found = jest.fn();
      const testPipe = contractMessages(testAbi, [testContractAddress])(from(extrinsics));

      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(2);
        }
      });
    });

    it('should work with mongoFilter', () => {
      const found = jest.fn();
      const testPipe = contractMessages(testAbi, testContractAddress)(from(extrinsics));

      testPipe.pipe(
        mongoFilter(
          {
            'args.value': { $bn_gt: 800000000 },
            'message.identifier': 'transfer'
          },
          contracts
        )
      ).subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });
  });

  describe('contractConstructors', () => {
    const txWithIdAndEventObs = from(extrinsics.splice(0, 3));

    beforeEach(() => {
      jest.spyOn(mockPromiseApi.query.contracts, 'contractInfoOf')
        .mockResolvedValue({
          isSome: () => true,
          unwrap: () => ({
            codeHash: testContractCodeHash
          })
        } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should emit decoded contract constructors', () => {
      const found = jest.fn();

      const testPipe = contractConstructors(mockPromiseApi, testAbi, testContractCodeHash)(txWithIdAndEventObs);

      testPipe.subscribe({
        next: constructor => {
          found();
          expect(constructor).toBeDefined();
          expect(constructor.message).toBeDefined();
          expect(constructor.message.identifier).toBe('new');
        },
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });

    it('should work with mongoFilter', () => {
      const found = jest.fn();

      const testPipe = contractConstructors(mockPromiseApi, testAbi, testContractCodeHash)(txWithIdAndEventObs);

      testPipe.pipe(
        mongoFilter(
          {
            'message.identifier': 'new'
          },
          contracts
        )
      ).subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });
  });

  describe('contractEvents', () => {
    it('should emit decoded contract events', () => {
      const found = jest.fn();

      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx));

      testPipe.subscribe({
        next: (result) => {
          found();
          expect(result.blockEvent).toBeDefined();
          expect(result.blockEvent.eventId).toBeDefined();
          expect(result.blockEvent.eventId).toBe('2841323-0-9');
          expect(result.event.identifier).toBe('Transfer');
          expect(result.event.index).toBe(0);
        },
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });

    it('should work with array of addresses', () => {
      const found = jest.fn();
      const testPipe = contractEvents(testAbi, [testContractAddress])(from(testEventsWithIdAndTx));

      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });

    it('should work with mongoFilter', () => {
      const found = jest.fn();
      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx));

      testPipe.pipe(
        mongoFilter(
          {
            'args.value': { $bn_gt: 800000000 },
            'event.identifier': 'Transfer'
          },
          contracts
        )
      ).subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });
  });
});