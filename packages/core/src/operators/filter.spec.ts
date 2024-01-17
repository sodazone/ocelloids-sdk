// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { from } from 'rxjs';

import { filterEvents } from './filter.js';

import { testBlocks } from '@sodazone/ocelloids-test';
import { EventWithId } from '../types/interfaces.js';

describe('filterEvents', () => {
  it('should emit events with contextual information', done => {
    const calls = jest.fn();
    const testPipe = filterEvents({
      section: { $exists: true }
    })(from(testBlocks));
    testPipe.subscribe({
      next: (event: EventWithId) => {
        calls();
        expect(event).toBeDefined();
        expect(event.blockNumber).toBeDefined();
      },
      complete: () => {
        expect(calls).toHaveBeenCalledTimes(148);
        done();
      }
    });
  });
  it('should allow to apply an extrinsic level criteria', done => {
    const calls = jest.fn();
    const testPipe = filterEvents({
      section: { $exists: true }
    },
    {
      'extrinsic.isSigned': true
    })(from(testBlocks));
    testPipe.subscribe({
      next: (event: EventWithId) => {
        calls();
        expect(event).toBeDefined();
        expect(event.blockNumber).toBeDefined();
      },
      complete: () => {
        expect(calls).toHaveBeenCalledTimes(32);
        done();
      }
    });
  });
});