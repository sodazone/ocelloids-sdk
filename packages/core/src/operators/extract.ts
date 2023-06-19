import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, concatMap, share } from 'rxjs';

/**
 * Operator to extract extrinsics with paired events from blocks.
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `TxWithEvents` included in the block.
 *
 * ## Example
 * ```ts
 * // Subscribe to new extrinsics on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractTxWithEvents()
 * ).subscribe(tx => console.log(`New extrinsic on Polkadot: ${tx.extrinsic.method.toHuman()}`));
 * ```
 */
export function extractTxWithEvents() {
  return (source: Observable<SignedBlockExtended>) => {
    return (source.pipe(
      concatMap(block => block.extrinsics),
      share()
    ));
  };
}

/**
 * Operator to extract event records from blocks.
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `EventRecord` included in the block.
 *
 * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractEventRecords()
 * ).subscribe(record => console.log(`New event on Polkadot: ${record.event.method.toHuman()}`));
 * ```
 */
export function extractEventRecords() {
  return (source: Observable<SignedBlockExtended>) => {
    return (source.pipe(
      concatMap(block => block.events),
      share()
    ));
  };
}