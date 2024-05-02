// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { from } from 'rxjs';

import { filterEvents, filterEventsWithTx } from './filter.js';

import { testBlocks } from '@sodazone/ocelloids-sdk-test';
import { BlockEvent, EventWithIdAndTx } from '../types/interfaces.js';

describe('filter operators', () => {
  describe('filterEventsWithTx', () => {
    it('should emit events with contextual information', (done) => {
      const calls = jest.fn();
      const testPipe = filterEventsWithTx({
        section: { $exists: true },
      })(from(testBlocks));
      testPipe.subscribe({
        next: (event: EventWithIdAndTx) => {
          calls();
          expect(event).toBeDefined();
          expect(event.blockNumber).toBeDefined();
        },
        complete: () => {
          expect(calls).toHaveBeenCalledTimes(148);
          done();
        },
      });
    });
    it('should allow to apply an extrinsic level criteria', (done) => {
      const calls = jest.fn();
      const testPipe = filterEventsWithTx(
        {
          section: { $exists: true },
        },
        {
          'extrinsic.isSigned': true,
        }
      )(from(testBlocks));
      testPipe.subscribe({
        next: (event: EventWithIdAndTx) => {
          expect(event).toBeDefined();
          expect(event.blockNumber).toBeDefined();
          calls();
        },
        complete: () => {
          expect(calls).toHaveBeenCalledTimes(32);
          done();
        },
      });
    });
  });

  describe('filterEvents', () => {
    it('should apply filter criteria over an event with associated extrinsic', (done) => {
      const calls = jest.fn();

      const testPipe = filterEvents({
        section: 'system',
        method: 'NewAccount',
      })(from(testBlocks));

      testPipe.subscribe({
        next: (event: BlockEvent) => {
          expect(event).toBeDefined();
          expect(event.blockNumber).toBeDefined();
          expect(event.eventId).toBeDefined();
          expect(event.extrinsic).toBeDefined();
          expect(event.extrinsicId).toBeDefined();
          expect(event.extrinsicPosition).toBeDefined();
          calls();
        },
        complete: () => {
          expect(calls).toHaveBeenCalledTimes(3);
          done();
        },
      });
    });

    it('should apply filter criteria over an event without extrinsic', (done) => {
      const calls = jest.fn();

      const testPipe = filterEvents({
        section: 'treasury',
        method: 'UpdatedInactive',
      })(from(testBlocks));

      testPipe.subscribe({
        next: (event: BlockEvent) => {
          expect(event).toBeDefined();
          expect(event.blockNumber).toBeDefined();
          expect(event.eventId).toBeDefined();
          expect(event.extrinsic).not.toBeDefined();
          expect(event.extrinsicId).not.toBeDefined();
          expect(event.extrinsicPosition).not.toBeDefined();
          calls();
        },
        complete: () => {
          expect(calls).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });
  });
});
