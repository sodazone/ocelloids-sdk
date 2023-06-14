import { ApiRx } from '@polkadot/api';
import { AnyNumber } from '@polkadot/types-codec/types';

import { Observable, concatMap, interval, map, mergeMap, range, shareReplay, switchMap, tap } from 'rxjs';

export function numberRange(from: number, int: number) {
  return interval(int)
    .pipe(
      map(c => (from + c) as AnyNumber)
    );
}

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

export function extrinsics() {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      blocks(),
      concatMap(block => block.extrinsics)
    ));
  };
}

export function blocksInRange(start: number, count: number) {
  return (source: Observable<ApiRx>) => {
    return (source.pipe(
      switchMap(api =>
        range(start, count).pipe(
          mergeMap(number =>
            api.derive.chain.getBlockByNumber(number)
          ),
        )
      )
    ).pipe(shareReplay()));
  };
}
