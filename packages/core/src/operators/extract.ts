import type { SignedBlock, EventRecord } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, concatMap, share } from 'rxjs';
import { GenericExtrinsicWithId } from '../types/extrinsic.js';

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
 * Operator to extract extrinsics from signed blocks.
 * Takes an `Observable<SignedBlock>` as input and emits each `Extrinsic` included in the block.
 * Additionally, expands the extrinsic data with a generated identifier.
 *
 * ## Example
 * ```ts
 * // Subscribe to new extrinsics on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractExtrinsics()
 * ).subscribe(xt => console.log(`New extrinsic on Polkadot: ${xt.toHuman()}`));
 * ```
 * @see {@link GenericExtrinsicWithId}
 */
export function extractExtrinsics() {
  return (source: Observable<SignedBlock>)
  : Observable<GenericExtrinsicWithId> => {
    return (source.pipe(
      concatMap(({block}) => {
        const blockNumber = block.header.number;
        return block.extrinsics.map(
          (xt, index) => new GenericExtrinsicWithId(
            blockNumber,
            index,
            xt
          ));
      }),
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
  return (source: Observable<SignedBlockExtended>)
  : Observable<EventRecord> => {
    return (source.pipe(
      concatMap(block => block.events),
      share()
    ));
  };
}