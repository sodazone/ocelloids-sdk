import { testBlocks, mockRxApi } from '@soda/ocelloids-test';

import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import { AnyNumber } from '@polkadot/types-codec/types';

import { blocksInRange } from './blocks.js';
import { Observable, map, of } from 'rxjs';

describe('blocks reactive operator', () => {
  describe('blocks', () => {
    it('should stream new heads', () => {
      // new heads test
    });
  });

  describe('blocksInRange', () => {
    it('should stream blocks in defined range', (done) => {
      let index = 0;
      const testObserver = {
        next: (mockBlock: SignedBlockExtended) => {
          expect(mockBlock).toBeDefined();
          expect(mockBlock.block.header.number).toEqual(testBlocks[index].block.header.number);
          index++;
        },
        complete: () => done(),
      };

      blocksInRange(15950017, 3)(mockRxApi)
        .subscribe(
          testObserver
        );
    });

    it('should catch error from API', (done) => {
      let spy: jest.SpyInstance<Observable<unknown>, [blockNumber: AnyNumber], any>;

      // Mock rx api implementation for getBlockByNumber() to throw on second block
      const testPipe = mockRxApi.pipe(
        map(api => {
          spy = jest.spyOn(api.derive.chain, 'getBlockByNumber')
            .mockImplementationOnce(() => of(testBlocks[0]))
            .mockImplementationOnce(() => {throw Error('Mock error');});
          return api;
        }),
        blocksInRange(15950017, 3)
      );

      testPipe.subscribe({
        next: (block) => {
          // Only the first block will be emitted to next()
          expect(block.block.header.number.toNumber()).toBe(15950017);
        },
        error: (err: Error) => {
          expect(err.message).toBe('Mock error');
          expect(spy).toBeCalledTimes(2);
          done();
        },
        complete: () => {
          // Should never get into complete
        },
      });
    });
  });
});