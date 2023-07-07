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

import type { SignedBlock } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, mergeMap, share } from 'rxjs';

import { GenericExtrinsicWithId, enhanceTxWithId } from '../types/extrinsic.js';
import { GenericEventWithId } from '../types/event.js';
import { EventWithIdAndTx, EventWithId, ExtrinsicWithId, TxWithIdAndEvent } from '../types/interfaces.js';

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
      mergeMap(({block, extrinsics}) => {
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
 *
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
 * ).subscribe(record => console.log(
 *   `New event on Polkadot: ${record.data.toHuman()}`
 * ));
 * ```
 *
 * @see {@link EventWithId}
 */
export function extractEvents() {
  return (source: Observable<SignedBlockExtended>): Observable<EventWithId> => {
    return source.pipe(
      mergeMap(({ block, extrinsics }) => {
        const blockNumber = block.header.number;

        return extrinsics.reduce((eventsWithId: EventWithId[], xt, i) => {
          const extrinsicId = `${blockNumber.toString()}-${i}`;

          return eventsWithId.concat(
            xt.events.map((e, extrinsicPosition) => (
              new GenericEventWithId(e, {
                blockNumber,
                extrinsicPosition,
                extrinsicId
              })
            ))
          );
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
 * The emitted events are expanded with additional contextual information, including block number,
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
 *   flattenBatch(),
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
        const eventRecords: EventWithIdAndTx[] = [];

        for (const [extrinsicPosition, event] of events.entries()) {
          const eventWithIdAndTx = new GenericEventWithId(event, {
            blockNumber,
            extrinsicPosition,
            extrinsicId: extrinsic.extrinsicId
          }) as EventWithIdAndTx;

          eventWithIdAndTx.extrinsic = extrinsic;

          eventRecords.push(eventWithIdAndTx);
        }

        return eventRecords;
      })
    );
  };
}