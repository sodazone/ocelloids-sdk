import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';

import { from } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@sodazone/ocelloids-test';

import { extractEventRecords, extractExtrinsics, extractTxWithEvents } from './extract.js';
import { ExtrinsicWithId, TxIdWithEvent as TxWithIdAndEvent } from '../types/extrinsic.js';

const blocks = testBlocks.slice(0, 3);

describe('extractors over extended signed blocks', () => {
  describe('extractTxWithEvents', () => {
    it('should emit extrinsics with paired events on new blocks', done => {
      const testPipe = extractTxWithEvents()(from(blocks));
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
      const testPipe = extractTxWithEvents()(from(blocks));
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
      const testPipe = extractExtrinsics()(from(blocks));
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
      const testPipe = extractEventRecords()(from(blocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: EventRecord) => {
          expect(result).toBeDefined();
          expect(result.event.method).toEqual(testEvents[index].event.method);
          expect(result.event.data).toEqual(testEvents[index].event.data);
          index++;
        },
        complete: done,
      });
    });
  });
});