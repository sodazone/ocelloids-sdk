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
 *
 * @see rxjs.range
 */
export function bnRange(start: AnyBN, count: AnyBN): Observable<BN> {
  const bnStart = new BN(start);
  const bnCount = new BN(count);

  if (bnCount <= ZERO) {
    return EMPTY;
  }

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