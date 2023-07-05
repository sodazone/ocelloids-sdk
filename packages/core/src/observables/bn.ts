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

import { EMPTY, Observable } from 'rxjs';

import { BN } from '@polkadot/util';

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