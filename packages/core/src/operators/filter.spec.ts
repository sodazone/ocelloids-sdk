/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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