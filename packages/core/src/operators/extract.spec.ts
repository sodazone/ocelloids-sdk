import type { TxWithEvent } from '@polkadot/api-derive/types';

import { from } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@sodazone/ocelloids-test';

import { extractEvents, extractExtrinsics, extractTxWithEvents } from './extract.js';
import { EventWithId, ExtrinsicWithId, TxWithIdAndEvent } from '../types/interfaces.js';

describe('extractors over extended signed blocks', () => {
  describe('extractTxWithEvents', () => {
    it('should emit extrinsics with paired events on new blocks', done => {
      const testPipe = extractTxWithEvents()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.method.toString())
            .toEqual(testExtrinsics[index].extrinsic.method.toString());
          expect(result.extrinsic.data).toEqual(testExtrinsics[index].extrinsic.data);
          index++;
        },
        complete: done,
      });
    });
    it('should emit extrinsics with id and paired events on new blocks', done => {
      const testPipe = extractTxWithEvents()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithIdAndEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.method.toString())
            .toEqual(testExtrinsics[index].extrinsic.method.toString());
          expect(result.extrinsic.data).toEqual(testExtrinsics[index].extrinsic.data);
          expect(result.extrinsic.extrinsicId).toBeDefined();
          index++;
        },
        complete: done,
      });
    });
  });

  describe('extractExtrinsics', () => {
    it('should emit extrinsics with id on new blocks', done => {
      const testPipe = extractExtrinsics()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (extrinsic: ExtrinsicWithId) => {
          expect(extrinsic).toBeDefined();
          expect(extrinsic.method.toString())
            .toEqual(testExtrinsics[index].extrinsic.method.toString());
          expect(extrinsic.data).toEqual(testExtrinsics[index].extrinsic.data);
          expect(extrinsic.extrinsicId).toBeDefined();
          index++;
        },
        complete: done
      });
    });
  });

  describe('extractEvents', () => {
    it('should emit event with id on new blocks', done => {
      const testPipe = extractEvents()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (event: EventWithId) => {
          expect(event).toBeDefined();
          expect(event.method.toString()).toEqual(testEvents[index].method.toString());
          expect(event.data.toString()).toEqual(testEvents[index].data.toString());
          expect(event.eventId).toBeDefined();
          index++;
        },
        complete: done,
      });
    });
  });
});