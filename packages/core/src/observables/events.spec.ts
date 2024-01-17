// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { EventRecord } from '@polkadot/types/interfaces';

import { mockRxApi, testEventRecords } from '@sodazone/ocelloids-test';

import { events } from './events.js';

describe('events reactive observable', () => {
  describe('events', () => {
    it('should emit the latest system events', done => {
      const testPipe = events()(mockRxApi);
      let index = 0;
      const next = jest.fn().mockImplementation((result: EventRecord) => {
        expect(result).toBeDefined();
        expect(result.event).toBeDefined();
        expect(result.event.section).toEqual(testEventRecords[index].event.section);
        expect(result.event.hash).toEqual(testEventRecords[index].event.hash);
        index++;
      });
      const complete = jest.fn().mockImplementation(() => {
        expect(index).toBe(testEventRecords.length);
        done();
      });

      testPipe.subscribe({
        next,
        complete,
      });

      expect(next).toHaveBeenCalledTimes(testEventRecords.length);
      expect(complete).toHaveBeenCalledTimes(1);
    });
  });
});