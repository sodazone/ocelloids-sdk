import {
  testContractAbi,
  testContractAddress,
  testContractExtrinsics,
  testContractBlocks
} from '@sodazone/ocelloids-test';

import { contractCalls } from './contracts.js';
import { from } from 'rxjs';
import {mongoFilterFrom } from './mongo-filter.js';
import { enhanceTxWithId } from '../types/extrinsic.js';
import { ContractMessageWithTx } from '../index.js';

const blockNumber = testContractBlocks[0].block.header.number;
const extrinsics = testContractExtrinsics.map(
  (xt, position) => enhanceTxWithId(
    blockNumber,
    position,
    xt
  )
);

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

describe('Wasm contracts operator', () => {
  describe('contractCalls', () => {
    it('should emit decoded contract calls', () => {
      const testPipe = contractCalls(testContractAbi, testContractAddress)(from(extrinsics));
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
      const testPipe = contractCalls(testContractAbi, testContractAddress)(from(extrinsics));

      testPipe.pipe(
        mongoFilterFrom({
          'args.value': { $gte: 800000000 },
          'message.identifier': 'transfer'
        })
      ).subscribe(found);

      expect(found).toBeCalledTimes(1);
    });
  });
});