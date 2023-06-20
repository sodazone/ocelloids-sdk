import type { TxWithEvent } from '@polkadot/api-derive/types';

import { of } from 'rxjs';

import { testExtrinsics, testBatchExtrinsic, testBatchCalls } from '@sodazone/ocelloids-test';

import { flattenBatch } from './flatten.js';

describe('flatten batch call operator', () => {
  describe('flattenBatch', () => {
    it('should flatten `utility.batchAll` extrinsics', done => {
      const testPipe = flattenBatch()(of(testBatchExtrinsic));
      let index = 0;

      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.signer.toJSON()).toEqual({ 'id': '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7' });

          // The first result should be the actual batch call
          // After that, the emitted extrinsics should be of the flattened calls
          if (index === 0) {
            expect(result.extrinsic.method.section).toBe('utility');
            expect(result.extrinsic.method.method).toBe('batchAll');
          } else {
            expect(result.extrinsic.method.toHuman()).toEqual(testBatchCalls[index - 1].toHuman());
          }

          index++;
        },
        complete: () => {
          expect(index).toBe(7);
          done();
        }
      });
    });

    it('should work with non-batched extrinsics', done => {
      let index = 0;
      const testPipe = flattenBatch()(of(testExtrinsics[2]));
      testPipe.subscribe({
        next: (result: TxWithEvent) => {
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