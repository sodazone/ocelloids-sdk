// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { TxWithEvent } from '@polkadot/api-derive/types';

import { from, of } from 'rxjs';

import { testBlocks, testExtrinsics, testEvents } from '@sodazone/ocelloids-test';

import { extractEventsWithTx, extractEvents, extractExtrinsics, extractTxWithEvents } from './extract.js';
import { EventWithId, EventWithIdAndTx, ExtrinsicWithId, TxWithIdAndEvent } from '../types/interfaces.js';

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
          expect(result.extrinsic.blockHash).toBeDefined();
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
          expect(extrinsic.blockHash).toBeDefined();
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
          expect(event.method).toEqual(testEvents[index].method);
          expect(event.data.toString()).toEqual(testEvents[index].data.toString());
          expect(event.blockHash).toBeDefined();
          expect(event.eventId).toBeDefined();
          index++;
        },
        complete: done,
      });
    });
  });

  describe('extractEventsWithTx', () => {
    it('should emit event with id and extrinsic on new blocks', done => {
      const testPipe = extractTxWithEvents()(of(testBlocks[0])).pipe(
        extractEventsWithTx()
      );
      testPipe.subscribe({
        next: (record: EventWithIdAndTx) => {
          expect(record).toBeDefined();
          expect(record.extrinsicPosition).toBeDefined();
          expect(record.extrinsic).toBeDefined();
          expect(record.eventId).toBeDefined();
          expect(record.blockHash).toBeDefined();
          expect(record.extrinsic.extrinsicId).toBeDefined();
          expect(record.blockHash.toString()).toEqual(record.extrinsic.blockHash.toString());
          expect(record.blockNumber.toString()).toEqual(record.extrinsic.blockNumber.toString());
        },
        complete: done,
      });
    });
  });
});