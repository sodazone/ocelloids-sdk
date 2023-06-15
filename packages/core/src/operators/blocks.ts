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

import { Observable, concatMap, mergeMap, range, shareReplay, switchMap } from 'rxjs';

export function blocks() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api =>
        api.rpc.chain.subscribeNewHeads().pipe(
          switchMap(({ number }) =>
            api.derive.chain.getBlockByNumber(number.toBigInt())
          )
        )
      )
    ));
  };
}

export function blocksInRange(
  start: number,
  count: number,
  sorted = true
) {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api =>
        range(start, count).pipe(
          sorted ?
            concatMap(number =>
              api.derive.chain.getBlockByNumber(number)
            ) :
            mergeMap(number =>
              api.derive.chain.getBlockByNumber(number))
        )
      )
    ).pipe(shareReplay()));
  };
}
