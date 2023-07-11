import { ApiRx } from '@polkadot/api';
import type { Extrinsic } from '@polkadot/types/interfaces';
import type { Vec } from '@polkadot/types';

import { Observable, share, switchMap } from 'rxjs';

/**
 * Returns an Observable that emits a Vec of pending extrinsics in the mempool.
 *
 * ## Example: Number of extrinsics in mempool
 * ```ts
 * apis.rx.polkadot.pipe(
 *   pendingExtrinsics()
 * ).subscribe(txs => console.log(`Number of pending extrinsics in mempool: ${txs.length}`))
 * ```
 *
 * ## Example: Emit pending extrinsics individually
 * ```ts
 * apis.rx.polkadot.pipe(
 *   pendingExtrinsics(),
 *   mergeMap(record => record.toArray())
 * ).subscribe(tx => console.log(`Extrinsic details: ${tx.toHuman()}`))
 * ```
 */
export function pendingExtrinsics() {
  return (source: Observable<ApiRx>)
  : Observable<Vec<Extrinsic>> => {
    return (source.pipe(
      switchMap(api => {
        return api.rpc.author.pendingExtrinsics();
      }),
      share()
    ));
  };
}
