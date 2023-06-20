import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import type { AnyNumber } from '@polkadot/types-codec/types';

import { testBlocks, mockRxApi } from '@sodazone/ocelloids-test';

import { blocks, blocksInRange } from './blocks.js';
import { Observable, map, of } from 'rxjs';

function observerForBlocks(done: jest.DoneCallback) {
  let index = 0;
  const next = jest.fn().mockImplementation((result: SignedBlockExtended) => {
    expect(result).toBeDefined();
    expect(result.block.header.number).toEqual(testBlocks[index].block.header.number);
    expect(result.block.hash).toEqual(testBlocks[index].block.hash);
    index++;
  });
  const complete = jest.fn().mockImplementation(() => {
    done();
  });
  return {next, complete};
}

describe('blocks reactive observable', () => {
  describe('blocks', () => {
    it('should emit the latest new block', done => {
      const testPipe = blocks()(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toBeCalledTimes(testBlocks.length);
      expect(o.complete).toBeCalledTimes(1);
    });

    it('should emit the latest finalized block', done => {
      const testPipe = blocks(true)(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toBeCalledTimes(testBlocks.length);
      expect(o.complete).toBeCalledTimes(1);
    });
  });

  describe('blocksInRange', () => {
    it('should stream blocks in defined range', (done) => {
      const testPipe = blocksInRange(15950017, 3)(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toBeCalledTimes(3);
      expect(o.complete).toBeCalledTimes(1);
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
        next: (result) => {
          // Only the first block will be emitted to next()
          expect(result.block.header.number.toNumber()).toBe(15950017);
        },
        error: (err: Error) => {
          expect(err.message).toBe('Mock error');
          expect(spy).toBeCalledTimes(2);
          done();
        },
      });
    });
  });
});
