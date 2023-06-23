import {
  testContractAbi,
  testContractAddress,
  testContractExtrinsics,
  testContractBlocks,
  testContractEvents
} from '@sodazone/ocelloids-test';

import { from } from 'rxjs';

import { contractEvents, contractMessages } from './contracts.js';
import { mongoFilterFrom } from './mongo-filter.js';
import { ContractMessageWithTx, GenericEventWithId, enhanceTxWithId } from '../types/index.js';

const blockNumber = testContractBlocks[0].block.header.number;
const extrinsics = testContractExtrinsics.map(
  (xt, blockPosition) => enhanceTxWithId(
    {
      blockNumber,
      blockPosition
    },
    xt
  )
);

const extrinsicId = `${blockNumber.toString()}-0`;
const events = testContractEvents.map((ev, blockPosition) => new GenericEventWithId(ev, {
  blockNumber,
  blockPosition,
  extrinsicPosition: blockPosition,
  extrinsicId
}));

describe('Wasm contracts operator', () => {
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
      const testPipe = contractMessages(testContractAbi, testContractAddress)(from(extrinsics));
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
      const testPipe = contractMessages(testContractAbi, testContractAddress)(from(extrinsics));

      testPipe.pipe(
        mongoFilterFrom({
          'args.value': { $bn_gt: 800000000 },
          'message.identifier': 'transfer'
        })
      ).subscribe(found);

      expect(found).toBeCalledTimes(1);
    });
  });

  describe('contractEvents', () => {
    it('should emit decoded contract events', () => {
      const expectedContractEvents = [
        {
          identifier: 'Transfer',
          index: 0
        },
        {
          identifier: 'Transfer',
          index: 0
        },
        {
          identifier: 'Approval',
          index: 1
        }
      ];
      const testPipe = contractEvents(testContractAbi, testContractAddress)(from(events));
      let index = 0;

      testPipe.subscribe((result) => {
        expect(result.blockEvent).toBeDefined();
        expect(result.blockEvent.eventId).toBeDefined();
        expect(result.event.identifier).toBe(expectedContractEvents[index].identifier);
        expect(result.event.index).toBe(expectedContractEvents[index].index);
        index++;
      });
    });

    it('should work with mongoFilter', () => {
      const found = jest.fn();
      const testPipe = contractEvents(testContractAbi, testContractAddress)(from(events));

      testPipe.pipe(
        mongoFilterFrom({
          'args.value': { $bn_gt: 800000000 },
          'event.identifier': 'Transfer'
        })
      ).subscribe(found);

      expect(found).toBeCalledTimes(2);
    });
  });
});