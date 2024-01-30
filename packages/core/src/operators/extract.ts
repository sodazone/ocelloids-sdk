// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { SignedBlock } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, mergeMap, share } from 'rxjs';

import { GenericExtrinsicWithId, enhanceTxWithIdAndEvents } from '../types/extrinsic.js';
import { GenericEventWithId, GenericEventWithIdAndTx } from '../types/event.js';
import { EventWithIdAndTx, ExtrinsicWithId, TxWithIdAndEvent, BlockEvent, EventBlockContext } from '../types/interfaces.js';

/**
 * Operator to extract extrinsics with paired events from blocks.
 *
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `TxWithEvents` included in the block.
 * Additionally, expands the extrinsic data with a generated identifier.
 *
 * ## Example
 * ```ts
 * // Subscribe to new extrinsics on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractTxWithEvents()
 * ).subscribe(tx => console.log(
 *   `New extrinsic on Polkadot: ${tx.extrinsic.method.toHuman()}`
 * ));
 * ```
 *
 * @see {@link TxWithIdAndEvent}
 */
export function extractTxWithEvents() {
  return (source: Observable<SignedBlockExtended>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      mergeMap(({ block, extrinsics, events }) => {
        const blockNumber = block.header.number;
        const blockHash = block.hash;
        return extrinsics.map(
          (xt, blockPosition) => {
            return enhanceTxWithIdAndEvents(
              {
                blockNumber,
                blockHash,
                blockPosition
              },
              xt,
              events
            );
          });
      }),
      share()
    ));
  };
}

/**
 * Operator to extract extrinsics from signed blocks.
 *
 * Takes an `Observable<SignedBlock>` as input and emits each `Extrinsic` included in the block.
 * Additionally, expands the extrinsic data with a generated identifier.
 *
 * ## Example
 * ```ts
 * // Subscribe to new extrinsics on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractExtrinsics()
 * ).subscribe(xt => console.log(
 *   `New extrinsic on Polkadot: ${xt.toHuman()}`
 * ));
 * ```
 * @see {@link ExtrinsicWithId}
 */
export function extractExtrinsics() {
  return (source: Observable<SignedBlock>)
  : Observable<ExtrinsicWithId> => {
    return (source.pipe(
      mergeMap(({block}) => {
        const blockNumber = block.header.number;
        const blockHash = block.hash;
        return block.extrinsics.map(
          (xt, blockPosition) => new GenericExtrinsicWithId(
            xt,
            {
              blockNumber,
              blockHash,
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
 *
 * Takes an `Observable<SignedBlockExtended>` as input and emits each `Event` included in the block.
 * The emitted events are expanded with the block context, including block number, block hash, position in block,
 * extrinsic ID, and position in extrinsic.
 *
 * @returns An operator function that transforms an Observable of `SignedBlockExtended` into an Observable of `BlockEvent`.
 *
 * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractEvents()
 * ).subscribe(record => console.log(
 *   `New event on Polkadot: ${record.data.toHuman()}`
 * ));
 * ```
 *
 * @see {@link BlockEvent}
 */
export function extractEvents() {
  return (source: Observable<SignedBlockExtended>): Observable<BlockEvent> => {
    return source.pipe(
      mergeMap(({ block, extrinsics, events }) => {
        const blockNumber = block.header.number;
        const blockHash = block.hash;

        let prevXtIndex = -1;
        let xtEventIndex = 0;

        // Loops through each event record in the block and enhance it with block context.
        // If event is emitted from an extrinsic, enhance also with extrinsic context.
        return events.reduce((blockEvents: BlockEvent[], { phase, event }, i) => {
          const eventBlockContext: EventBlockContext = {
            blockNumber,
            blockHash,
            blockPosition: i
          };
          const extrinsicIndex = phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : undefined;

          if (extrinsicIndex) {
            const extrinsic = new GenericExtrinsicWithId(extrinsics[extrinsicIndex].extrinsic, {
              blockNumber,
              blockHash,
              blockPosition: extrinsicIndex
            });
            // If we have moved on to the next extrinsic,
            // reset the event index to 0
            if (extrinsicIndex > prevXtIndex) {
              xtEventIndex = 0;
            }

            blockEvents.push(
              new GenericEventWithIdAndTx(event, {
                ...eventBlockContext,
                extrinsicId: extrinsic.extrinsicId,
                extrinsic,
                extrinsicPosition: xtEventIndex
              })
            );
            // Increase event index in extrinsic for next loop
            xtEventIndex++;
            // Assign current extrinsic index to prevXtIndex
            prevXtIndex = extrinsicIndex;
          } else {
            blockEvents.push(
              new GenericEventWithId(event, eventBlockContext)
            );
          }

          return blockEvents;
        }, []);
      }),
      share()
    );
  };
}

/**
 * Operator to extract events with associated extrinsic from extrinsics with id.
 *
 * Takes an `Observable<TxWithIdAndEvent>` as input and emits each event along with its associated extrinsic.
 * The emitted events are expanded with additional contextual information, including block number, block hash,
 * extrinsic ID, and position in extrinsic.
 *
 * @returns An operator function that transforms an Observable of `TxWithIdAndEvent` into an Observable of `EventWithIdAndTx`.
 *
 * * ## Example
 * ```ts
 * // Subscribe to new events on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   extractTxWithEvents(),
 *   flattenCalls(),
 *   extractEventsWithTx()
 * ).subscribe(record => console.log(
 *   `New event on Polkadot: ${record.data.toHuman()}`
 * ));
 * ```
 *
 * @see {@link EventWithIdAndTx}
 */
export function extractEventsWithTx() {
  return (source: Observable<TxWithIdAndEvent>): Observable<EventWithIdAndTx> => {
    return source.pipe(
      mergeMap(({ extrinsic, events }) => {
        const blockNumber = extrinsic.blockNumber;
        const blockHash = extrinsic.blockHash;
        const eventRecords: EventWithIdAndTx[] = [];

        for (const [extrinsicPosition, event] of events.entries()) {
          const eventWithIdAndTx = new GenericEventWithIdAndTx(event, {
            blockNumber,
            blockHash,
            blockPosition: event.blockPosition,
            extrinsicPosition,
            extrinsicId: extrinsic.extrinsicId,
            extrinsic
          }) as EventWithIdAndTx;

          eventWithIdAndTx.extrinsic = extrinsic;

          eventRecords.push(eventWithIdAndTx);
        }

        return eventRecords;
      })
    );
  };
}