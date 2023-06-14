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
import { logger } from '@polkadot/util';

import { Observable, switchMap, mergeMap, timer, catchError, concatMap, EMPTY } from 'rxjs';

import { blocks } from './blocks';

const l = logger('oc-ops-extrinsics');

export function extrinsics() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      blocks(),
      concatMap(block => block.extrinsics)
    ));
  };
}

export function pendingExtrinsics({ interval } = { interval: 5000 }) {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap((api: ApiRx) =>
        timer(0, interval).pipe(
          mergeMap(_ => api.rpc.author.pendingExtrinsics()),
          catchError(err => {
            l.error(`ERROR: ${err}`);
            return EMPTY;
          }),
          concatMap(record => record.toArray())
        )
      )
    ));
  };
}