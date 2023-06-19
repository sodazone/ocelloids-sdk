import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';

import { from } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@soda/ocelloids-test';

import { extractEventRecords, extractTxWithEvents } from './extract.js';

describe('extrinsics reactive observable', () => {
  describe('extractTxWithEvents', () => {
    it('should emit extrinsics with paired events on new blocks', done => {
      const testPipe = extractTxWithEvents()(from(testBlocks));
      let index = 0;
      testPipe.subscribe({
        next: (result: TxWithEvent) => {
          expect(result).toBeDefined();
          expect(result.extrinsic.method).toEqual(testExtrinsics[index].extrinsic.method);
          expect(result.extrinsic.data).toEqual(testExtrinsics[index].extrinsic.data);
          index++;
        },
        complete: () => done(),
      });
    });
  });

  describe('extractEventRecords', () => {
    it('should emit event records on new blocks', done => {
      const testPipe = extractEventRecords()(from(testBlocks));
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