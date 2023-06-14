import { ApiRx } from '@polkadot/api';
import { Vec } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { logger } from '@polkadot/util';

import { EMPTY, Observable, catchError, concatMap, share, switchMap } from 'rxjs';

const l = logger('oc-ops-events');

export function events() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api => api.query.system.events()),
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