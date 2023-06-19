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

import { ApiRx } from '@polkadot/api';

import { Observable, catchError, concatMap, mergeMap, share, shareReplay, switchMap } from 'rxjs';

import { AnyBN, bnRange } from '../observables/bn.js';

/**
 * Returns an Observable that emits the latest new block.
 *
 * ## Example
 * ```ts
 * // Subscribe to new blocks on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks()
 * ).subscribe(x => console.log(`New block on Polkadot has hash ${x.block.hash.toHuman()}`))
 * ```
 */
export function blocks() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api =>
        api.rpc.chain.subscribeNewHeads().pipe(
          switchMap(({ number }) =>
            api.derive.chain.getBlockByNumber(number.toBigInt())
          )
        )
      ),
      catchError((err: Error) => {
        throw err;
      })
    ).pipe(share()));
  };
}

/**
 * Returns an Observable that emits blocks within a specified range.
 * By default, blocks are emitted in order,
 * but you can configure it to emit blocks in an unsorted order for better performance.
 *
 * @param start - The starting block number.
 * @param count - The number of blocks to emit.
 * @param sorted - (Optional) Whether to emit blocks in order. Default is `true`.
 */
export function blocksInRange(
  start: AnyBN,
  count: AnyBN,
  sorted = true
) {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api =>
        bnRange(start, count).pipe(
          sorted ?
            concatMap(number =>
              api.derive.chain.getBlockByNumber(number)
            ) :
            mergeMap(number =>
              api.derive.chain.getBlockByNumber(number))
        )
      ),
      catchError((err: Error) => {
        throw err;
      })
    ).pipe(shareReplay()));
  };
}