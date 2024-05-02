// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { Header } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import type { AnyNumber } from '@polkadot/types-codec/types';

import { testBlocks, mockRxApi } from '@sodazone/ocelloids-sdk-test';

import { blocks, blocksInRange, finalizedBlocks, finalizedHeads, heads } from './blocks.js';
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
  return { next, complete };
}

function observerForHeads(done: jest.DoneCallback) {
  let index = 0;
  const next = jest.fn().mockImplementation((result: Header) => {
    expect(result).toBeDefined();
    expect(result.number).toEqual(testBlocks[index].block.header.number);
    expect(result.hash).toEqual(testBlocks[index].block.hash);
    index++;
  });
  const complete = jest.fn().mockImplementation(() => {
    done();
  });
  return { next, complete };
}

describe('blocks reactive observable', () => {
  describe('blocks', () => {
    it('should emit the latest new head', (done) => {
      const testPipe = heads()(mockRxApi);
      const o = observerForHeads(done);
      testPipe.subscribe(o);

      expect(o.next).toHaveBeenCalledTimes(testBlocks.length);
      expect(o.complete).toHaveBeenCalledTimes(1);
    });

    it('should emit the latest finalized head', (done) => {
      const testPipe = finalizedHeads()(mockRxApi);
      const o = observerForHeads(done);
      testPipe.subscribe(o);

      expect(o.next).toHaveBeenCalledTimes(testBlocks.length);
      expect(o.complete).toHaveBeenCalledTimes(1);
    });

    it('should emit the latest new block', (done) => {
      const testPipe = blocks()(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toHaveBeenCalledTimes(testBlocks.length);
      expect(o.complete).toHaveBeenCalledTimes(1);
    });

    it('should emit the latest finalized block', (done) => {
      const testPipe = finalizedBlocks()(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toHaveBeenCalledTimes(testBlocks.length);
      expect(o.complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('blocksInRange', () => {
    it('should stream blocks in defined range in sequence', (done) => {
      const testPipe = blocksInRange(15950017, 3)(mockRxApi);
      const o = observerForBlocks(done);
      testPipe.subscribe(o);

      expect(o.next).toHaveBeenCalledTimes(3);
      expect(o.complete).toHaveBeenCalledTimes(1);
    });

    it('should stream blocks in defined range', (done) => {
      const testPipe = blocksInRange(15950017, 3, false)(mockRxApi);
      const calls = jest.fn();
      testPipe.subscribe({
        next: calls,
        complete: done,
      });

      expect(calls).toHaveBeenCalledTimes(3);
    });

    it('should catch error from API', (done) => {
      let spy: jest.SpyInstance<Observable<unknown>, [blockNumber: AnyNumber], any>;

      // Mock rx api implementation for getBlockByNumber() to throw on second block
      const testPipe = mockRxApi.pipe(
        map((api) => {
          spy = jest
            .spyOn(api.derive.chain, 'getBlockByNumber')
            .mockImplementationOnce(() => of(testBlocks[0]))
            .mockImplementationOnce(() => {
              throw Error('Mock error');
            });
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
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });
  });
});
