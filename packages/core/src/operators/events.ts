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
import { Vec } from '@polkadot/types';
import type { EventRecord } from '@polkadot/types/interfaces';
import { logger } from '@polkadot/util';

import { EMPTY, Observable, catchError, concatMap, share, switchMap } from 'rxjs';

const l = logger('oc-ops-events');

export function events() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api => api.query['system']['events']()),
      catchError((err: Error) => {
        l.error(`ERROR: ${err}`);
        return EMPTY; // completes
      }),
      concatMap((record) => (
        (record as Vec<EventRecord>).toArray()
      ))
    )).pipe(share());
  };
}