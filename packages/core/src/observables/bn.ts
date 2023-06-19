import { EMPTY, Observable } from 'rxjs';

import { BN } from '@polkadot/util';

export type AnyBN = number | string | number[] | Uint8Array | Buffer | BN;

const ZERO = new BN(0);
const ONE = new BN(1);

/**
 * Emits a sequence of big numbers within a specified range.
 *
 * @param start The value of the first integer in the sequence.
 * @param count The number of sequential integers to generate.
 * @returns An Observable of AnyBN that emits a finite range of sequential integers.
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

  return new Observable(
    (subscriber) => {
      let n = bnStart;
      while (n.lt(end) && !subscriber.closed) {
        subscriber.next(n);
        n = n.add(ONE);
      }
      subscriber.complete();
    }
  );
}