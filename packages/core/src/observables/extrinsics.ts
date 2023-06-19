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

import { Observable, switchMap, mergeMap, timer, catchError, concatMap, EMPTY, share } from 'rxjs';

import { blocks } from './blocks.js';

/**
 * Returns an Observable that emits the latest extrinsics.
 * Retrieves latest new block and extracts extrinsics included in the block.
 */
export function extrinsics() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      blocks(),
      concatMap(block => block.extrinsics),
      share()
    ));
  };
}

/**
 * Returns an Observable that emits pending extrinsics from the mempool.
 * The Observable periodically checks the mempool at a specified interval.
 *
 * @param interval - (Optional) The interval in milliseconds at which to check for pending extrinsics. Default is 5000ms.
 */
export function pendingExtrinsics({ interval } = { interval: 5000 }) {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap((api: ApiRx) =>
        timer(0, interval).pipe(
          mergeMap(_ => api.rpc.author.pendingExtrinsics()),
          concatMap(record => record.toArray())
        )
      ),
      share()
    ));
  };
}