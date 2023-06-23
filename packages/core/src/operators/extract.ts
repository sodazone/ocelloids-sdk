import type { SignedBlock } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, concatMap, share } from 'rxjs';

import { GenericExtrinsicWithId, enhanceTxWithId } from '../types/extrinsic.js';
import { GenericEventWithId } from '../types/event.js';
import { EventWithIdAndTx, EventWithId, ExtrinsicWithId, TxWithIdAndEvent } from '../types/interfaces.js';

/**
 * Operator to extract extrinsics with paired events from blocks.
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `TxWithEvents` included in the block.
 * Additionally, expands the extrinsic data with a generated identifier.
 *
 * ## Example
 * ```ts
 * // Subscribe to new extrinsics on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractTxWithEvents()
 * ).subscribe(tx => console.log(`New extrinsic on Polkadot: ${tx.extrinsic.method.toHuman()}`));
 * ```
 *
 * @see {@link TxWithIdAndEvent}
 */
export function extractTxWithEvents() {
  return (source: Observable<SignedBlockExtended>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      concatMap(({block, extrinsics}) => {
        const blockNumber = block.header.number;
        return extrinsics.map(
          (xt, blockPosition) => enhanceTxWithId(
            {
              blockNumber,
              blockPosition
            },
            xt
          ));
      }),
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
 * @see {@link ExtrinsicWithId}
 */
export function extractExtrinsics() {
  return (source: Observable<SignedBlock>)
  : Observable<ExtrinsicWithId> => {
    return (source.pipe(
      concatMap(({block}) => {
        const blockNumber = block.header.number;
        return block.extrinsics.map(
          (xt, blockPosition) => new GenericExtrinsicWithId(
            xt,
            {
              blockNumber,
              blockPosition
            }
          ));
      }),
      share()
    ));
  };
}

/**
 * Operator to extract events from blocks and provide additional contextual information.
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `Event` included in the block.
 * The emitted events are expanded with the block context, including block number, position in block,
 * extrinsic ID, and position in extrinsic.
 *
 * @returns An operator function that transforms an Observable of `SignedBlockExtended` into an Observable of `EventWithId`.
 *
 * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractEvents()
 * ).subscribe(record => console.log(`New event on Polkadot: ${record.data.toHuman()}`));
 * ```
 *
 * @see {@link EventWithId}
 */
export function extractEvents() {
  return (source: Observable<SignedBlockExtended>): Observable<EventWithId> => {
    return source.pipe(
      concatMap(({ block, extrinsics }) => {
        const blockNumber = block.header.number;
        let blockPosition = -1;

        return extrinsics.reduce((eventsWithId: EventWithId[], xt, i) => {
          const extrinsicId = `${blockNumber.toString()}-${i}`;

          return eventsWithId.concat(
            xt.events.map((e, extrinsicPosition) => {
              blockPosition++;

              return new GenericEventWithId(e, {
                blockNumber,
                blockPosition,
                extrinsicPosition,
                extrinsicId
              });
            })
          );
        }, []);
      }),
      share()
    );
  };
}

/**
 * Operator to extract events with associated extrinsic from blocks.
 * Takes an `Observable<SignedBlockExtended>` as input and emits each event along with its associated extrinsic.
 * The emitted events are expanded with additional contextual information, including block number, position in block,
 * extrinsic ID, and position in extrinsic.
 *
 * @returns An operator function that transforms an Observable of `SignedBlockExtended` into an Observable of `EventWithIdAndTx`.
 *
 * * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractEventsWithTx()
 * ).subscribe(record => console.log(`New event on Polkadot: ${record.data.toHuman()}`));
 * ```
 *
 * @see {@link EventWithIdAndTx}
 */
export function extractEventsWithTx() {
  return (source: Observable<SignedBlockExtended>): Observable<EventWithIdAndTx> => {
    return source.pipe(
      concatMap(({ block, extrinsics, events }) => {
        const blockNumber = block.header.number;
        const eventRecords: EventWithIdAndTx[] = [];

        for (const [blockPosition, record] of events.entries()) {
          const { phase: { isApplyExtrinsic, asApplyExtrinsic }, event } = record;

          if (isApplyExtrinsic) {
            const extrinsicPositionInBlock = asApplyExtrinsic.toNumber();
            const xt = extrinsics[extrinsicPositionInBlock];
            const extrinsicPosition = xt.events.findIndex(e => e.eq(event));
            const extrinsicId = `${blockNumber}-${extrinsicPositionInBlock}`;

            const eventWithIdAndTx = new GenericEventWithId(event, {
              blockNumber,
              blockPosition,
              extrinsicPosition,
              extrinsicId
            }) as EventWithIdAndTx;

            eventWithIdAndTx.extrinsic = new GenericExtrinsicWithId(xt.extrinsic, {
              blockNumber,
              blockPosition: extrinsicPositionInBlock
            });

            eventRecords.push(eventWithIdAndTx);
          }
        }

        return eventRecords;
      })
    );
  };
}