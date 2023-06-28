import {
  mockPromiseApi,
  testContractMetadata,
  testContractAddress,
  testContractExtrinsics,
  testContractBlocks,
  testContractEvents
} from '@sodazone/ocelloids-test';

import { Abi } from '@polkadot/api-contract';

import { from } from 'rxjs';

import { types, mongoFilterFrom } from '@sodazone/ocelloids';

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
// console.log('test events with tx -> ', testEventsWithIdAndTx.map(ev => ev.toHuman()));

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

    it('should work with mongoFilter', () => {
      const found = jest.fn();
      const testPipe = contractMessages(testAbi, testContractAddress)(from(extrinsics));

      testPipe.pipe(
        mongoFilterFrom(
          {
            'args.value': { $bn_gt: 800000000 },
            'message.identifier': 'transfer'
          },
          contracts
        )
      ).subscribe({
        next: found,
        complete: () => {
          expect(found).toBeCalledTimes(1);
        }
      });
    });
  });

  describe('contractConstructors', () => {
    it('should emit decoded contract constructors', () => {
      const found = jest.fn();
      const codeHash = '0xb1fc0d2c3df7250059748b65eb7ac72611bcaff728cc44b7aa8a27cd22a95417';

      jest.spyOn(mockPromiseApi.query.contracts, 'contractInfoOf')
        .mockResolvedValue({
          isSome: () => true,
          unwrap: () => ({
            codeHash
          })
        } as any);

      const testPipe = contractConstructors(mockPromiseApi, testAbi, codeHash)(from(testEventsWithIdAndTx));

      testPipe.subscribe({
        next: constructor => {
          found();
          expect(constructor).toBeDefined();
          expect(constructor.message.identifier).toBe('new');
          expect(constructor.codeHash).toBe(codeHash);
        },
        complete: () => {
          expect(found).toBeCalledTimes(1);
        }
      });
    });
  });

  describe('contractEvents', () => {
    it('should emit decoded contract events', () => {
      const found = jest.fn();

      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx));
      let index = 0;

      testPipe.subscribe({
        next: (result) => {
          found();
          expect(result.blockEvent).toBeDefined();
          expect(result.blockEvent.eventId).toBeDefined();
          expect(result.blockEvent.eventId).toBe('2841323-0-9');
          expect(result.event.identifier).toBe('Transfer');
          expect(result.event.index).toBe(0);
          index++;
        },
        complete: () => {
          expect(found).toBeCalledTimes(1);
        }
      });
    });

    it('should work with mongoFilter', () => {
      const found = jest.fn();
      const testPipe = contractEvents(testAbi, testContractAddress)(from(testEventsWithIdAndTx));

      testPipe.pipe(
        mongoFilterFrom(
          {
            'args.value': { $bn_gt: 800000000 },
            'event.identifier': 'Transfer'
          },
          contracts
        )
      ).subscribe({
        next: found,
        complete: () => {
          expect(found).toBeCalledTimes(1);
        }
      });
    });
  });
});