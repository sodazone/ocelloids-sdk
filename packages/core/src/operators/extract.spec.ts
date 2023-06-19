import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';

import { from } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@soda/ocelloids-test';

import { extractEvents, extractExtrinsics } from './extract.js';

describe('extrinsics reactive observable', () => {
  describe('extractExtrinsics', () => {
    it('should emit extrinsics on new blocks', done => {
      const testPipe = extractExtrinsics()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.hash).toEqual(testExtrinsics[index].extrinsic.hash);
          expect(result.extrinsic.data).toEqual(testExtrinsics[index].extrinsic.data);
          index++;
        },
        complete: () => done(),
      });
    });
  });

  describe('extractEvents', () => {
    it('should emit events on new blocks', done => {
      const testPipe = extractEvents()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: EventRecord) => {
          expect(result).toBeDefined();
          expect(result.event.method).toEqual(testEvents[index].event.method);
          expect(result.event.data).toEqual(testEvents[index].event.data);
          index++;
        },
        complete: () => done(),
      });
    });
  });
});