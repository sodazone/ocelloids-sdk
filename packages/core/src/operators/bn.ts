import { EMPTY, Observable } from 'rxjs';

import { BN } from '@polkadot/util';

export type AnyBN = number | string | number[] | Uint8Array | Buffer | BN;

const ZERO = new BN(0);
const ONE = new BN(1);

/**
 * Big number range.
 *
 * @param start
 * @param count
 * @returns
 */
export function bnRange(start: AnyBN, count: AnyBN): Observable<BN> {
  const bnStart = new BN(start);
  const bnCount = new BN(count);

  if (bnCount <= ZERO) {
    // No count? We're going nowhere. Return EMPTY.
    return EMPTY;
  }

  // Where the range should stop.
  const end = bnCount.add(bnStart);

  return new Observable(
    (subscriber) => {
      let n = bnStart;
      while (n < end && !subscriber.closed) {
        subscriber.next(n);
        n = n.add(ONE);
      }
      subscriber.complete();
    }
  );
}