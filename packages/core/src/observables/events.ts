// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { EventRecord } from '@polkadot/types/interfaces';
import { ApiRx } from '@polkadot/api';

import { Observable, map, share, switchMap } from 'rxjs';

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
  return (source: Observable<ApiRx>)
  : Observable<EventRecord> => {
    return (source.pipe(
      switchMap(api => api.query.system.events()),
      map(codec => codec as EventRecord),
      share()
    ));
  };
}