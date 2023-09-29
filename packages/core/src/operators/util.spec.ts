/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
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

import { from, toArray } from 'rxjs';
import { filterNonNull } from './util.js';

describe('utility operators', () => {
  it('should filter null and undefined values', done => {
    from([1,2,null,3,,4,undefined,5]).pipe(
      filterNonNull(),
      toArray()
    ).subscribe(x => {
      expect(x).toStrictEqual([1,2,3,4,5]);
      done();
    });
  });
});