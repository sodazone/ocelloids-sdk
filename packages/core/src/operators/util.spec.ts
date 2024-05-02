// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { from, toArray } from 'rxjs';
import { filterNonNull } from './util.js';

describe('utility operators', () => {
  it('should filter null and undefined values', (done) => {
    from([1, 2, null, 3, 4, undefined, 5])
      .pipe(filterNonNull(), toArray())
      .subscribe((x) => {
        expect(x).toStrictEqual([1, 2, 3, 4, 5]);
        done();
      });
  });
});
