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

import type { Vec } from '@polkadot/types';
import type { EventRecord } from '@polkadot/types/interfaces';

import { ApiRx } from '@polkadot/api';

import { Observable, concatMap, share, switchMap } from 'rxjs';

/**
 * Returns an Observable that emits events from the system.
 *
 * * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   events()
 * ).subscribe(x => console.log(`New event on Polkadot has index ${x.event.index.toHuman()}`))
 * ```
 */
export function events() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api => api.query.system.events()),
      concatMap((record) => (
        (record as Vec<EventRecord>).toArray()
      )),
      share()
    ));
  };
}