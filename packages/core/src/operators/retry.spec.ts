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

import { defer, of, throwError } from 'rxjs';
import { retryWithTruncatedExpBackoff, truncatedExpBackoff } from './retry.js';

const errorUntil = (until: number) => {
  let c = 0;
  return defer(() => (++c < until) ?
    throwError(() => Error('some')) :
    of(c)
  );
};

describe('retry with truncated exponential backoff', () => {
  it('should not retry', done => {
    of(1).pipe(
      retryWithTruncatedExpBackoff()
    ).subscribe(x => {
      expect(x).toBe(1);
      done();
    });
  });

  it('should retry 3 times', done => {
    errorUntil(3).pipe(
      retryWithTruncatedExpBackoff({ baseDelay: 1 })
    ).subscribe(x => {
      expect(x).toBe(3);
      done();
    });
  });

  it('should truncate on infinity', done => {
    truncatedExpBackoff(1, 10)(null, Infinity)
      .subscribe(() => {
        done();
      });
  });
});