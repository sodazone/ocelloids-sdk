// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { EMPTY, Observable } from 'rxjs';

import { BN } from '@polkadot/util';

/**
 * Represents a flexible type that accepts various representations of numeric values.
 */
export type AnyBN = number | string | number[] | Uint8Array | Buffer | BN;

const ZERO = new BN(0);
const ONE = new BN(1);

/**
 * Emits a sequence of big numbers within a specified range.
 *
 * @param start The value of the first number in the sequence.
 * @param count The number of sequential numbers to generate.
 * @returns An Observable that emits a finite range of sequential big numbers.
 *
 * @see rxjs.range
 */
export function bnRange(start: AnyBN, count: AnyBN): Observable<BN> {
  const bnStart = new BN(start);
  const bnCount = new BN(count);

  if (bnCount.lte(ZERO)) {
    return EMPTY;
  }

  const end = bnCount.add(bnStart);

  return new Observable((subscriber) => {
    let n = bnStart;
    while (n.lt(end) && !subscriber.closed) {
      subscriber.next(n);
      n = n.add(ONE);
    }
    subscriber.complete();
  });
}
