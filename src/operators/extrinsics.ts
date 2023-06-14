import { ApiRx } from '@polkadot/api';
import { logger } from '@polkadot/util';

import { Observable, switchMap, mergeMap, timer, catchError, concatMap, EMPTY } from 'rxjs';

const l = logger('oc-ops-extrinsics');

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