// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { TestScheduler } from 'rxjs/testing';
import { concatMap, delay, of } from 'rxjs';

import { bnRange } from './bn.js';
import { BN } from '@polkadot/util';

describe('range', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler((actual, expected) => expect(expected).toStrictEqual(actual));
  });

  it('should create an observable with numbers 1 to 10', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const delayAmount = time('--|');
      const expected = '        a-b-c-d-e-f-g-h-i-(j|)';

      const e1 = bnRange(1, 10)
        .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : delayAmount))));
      const values = {
        a: new BN(1),
        b: new BN(2),
        c: new BN(3),
        d: new BN(4),
        e: new BN(5),
        f: new BN(6),
        g: new BN(7),
        h: new BN(8),
        i: new BN(9),
        j: new BN(10),
      };
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should work for two subscribers', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const delayAmount = time('--|');
      const expected = '        a-b-c-d-(e|)';

      const e1 = bnRange(1, 5)
        .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : delayAmount))));

      const values = {
        a: new BN(1),
        b: new BN(2),
        c: new BN(3),
        d: new BN(4),
        e: new BN(5),
      };
      expectObservable(e1).toBe(expected, values);
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should synchronously create a range of values by default', () => {
    const results = [] as any[];
    bnRange(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).toStrictEqual([
      new BN(12), new BN(13), new BN(14), new BN(15)
    ]);
  });

  it('should return empty for range(0)', () => {
    const results: any[] = [];
    bnRange(0, 0).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('done'),
    });
    expect(results).toStrictEqual(['done']);
  });

  it('should return empty for range with a negative count', () => {
    const results: any[] = [];
    bnRange(5, -5).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('done'),
    });
    expect(results).toStrictEqual(['done']);
  });
});