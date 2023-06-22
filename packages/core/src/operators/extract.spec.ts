import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';

import { from } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@sodazone/ocelloids-test';

import { extractEventRecordsWithId, extractExtrinsics, extractTxWithEvents } from './extract.js';
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

  describe('extractEventRecords', () => {
    it('should emit event records on new blocks', done => {
      const testPipe = extractEventRecordsWithId()(from(testBlocks));
      testPipe.subscribe({
        next: (event: EventWithId) => {
          expect(event).toBeDefined();
          expect(event.method).toBeDefined();
          expect(event.data).toBeDefined();
          expect(event.toHuman).toBeDefined();
          expect(event.eventId).toBeDefined();
        },
        complete: done,
      });
    });
  });
});