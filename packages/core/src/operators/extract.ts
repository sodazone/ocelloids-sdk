// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { SignedBlockExtended, TxWithEvent } from '@polkadot/api-derive/types'
import type { u64 } from '@polkadot/types-codec'
import type { SignedBlock } from '@polkadot/types/interfaces'

import { Observable, from, map, mergeMap, share } from 'rxjs'

import { GenericEventWithId, GenericEventWithIdAndTx } from '../types/event.js'
import { GenericExtrinsicWithId, enhanceTxWithIdAndEvents } from '../types/extrinsic.js'
import {
  BlockEvent,
  EventBlockContext,
  EventWithIdAndTx,
  ExtrinsicWithId,
  TxWithIdAndEvent,
} from '../types/interfaces.js'

function getTimestampFromBlock(extrinsics: TxWithEvent[]) {
  const setTimestamp = extrinsics.find(
    ({ extrinsic: { method } }) => method.section === 'timestamp' && method.method === 'set'
  )
  if (setTimestamp) {
    return setTimestamp.extrinsic.args[0] as u64
  }
}

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
  return (source: Observable<SignedBlockExtended>): Observable<TxWithIdAndEvent> => {
    return source.pipe(
      mergeMap(({ block, extrinsics, events }) => {
        const blockNumber = block.header.number
        const blockHash = block.hash
        const timestamp = getTimestampFromBlock(extrinsics)
        return extrinsics.map((xt, blockPosition) => {
          return enhanceTxWithIdAndEvents(
            {
              blockNumber,
              blockHash,
              blockPosition,
              timestamp,
            },
            xt,
            events
          )
        })
      }),
      share()
    )
  }
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
  return (source: Observable<SignedBlock>): Observable<ExtrinsicWithId> => {
    return source.pipe(
      mergeMap(({ block }) => {
        const blockNumber = block.header.number
        const blockHash = block.hash
        return block.extrinsics.map(
          (xt, blockPosition) =>
            new GenericExtrinsicWithId(xt, {
              blockNumber,
              blockHash,
              blockPosition,
            })
        )
      }),
      share()
    )
  }
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
      map(({ block, events, extrinsics }) => {
        return {
          extrinsics: block.extrinsics,
          events,
          blockNumber: block.header.number,
          blockHash: block.hash,
          timestamp: getTimestampFromBlock(extrinsics),
        }
      }),
      mergeMap(({ extrinsics, events, blockHash, blockNumber, timestamp }) => {
        let prevXtIndex = -1
        let xtEventIndex = 0
        let extrinsicWithId: ExtrinsicWithId | undefined
        // TODO: use inner Observable to stream events
        // Loops through each event record in the block and enhance it with block context.
        // If event is emitted from an extrinsic, enhance also with extrinsic context.
        return from(events).pipe(
          map(({ phase, event }, index) => {
            const eventBlockContext: EventBlockContext = {
              blockNumber,
              blockHash,
              blockPosition: index,
              timestamp,
            }
            const extrinsicIndex = phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : undefined
            if (extrinsicIndex) {
              if (extrinsicWithId === undefined) {
                extrinsicWithId = new GenericExtrinsicWithId(extrinsics[extrinsicIndex], {
                  blockNumber,
                  blockHash,
                  blockPosition: extrinsicIndex,
                  timestamp,
                })
              }

              const blockEvent = new GenericEventWithIdAndTx(event, {
                ...eventBlockContext,
                extrinsicId: extrinsicWithId.extrinsicId,
                extrinsic: extrinsicWithId,
                extrinsicPosition: xtEventIndex,
              })

              // If we have moved on to the next extrinsic,
              // reset the event index to 0
              if (extrinsicIndex > prevXtIndex) {
                xtEventIndex = 0
                extrinsicWithId = undefined
              }

              // Increase event index in extrinsic for next loop
              xtEventIndex++
              // Assign current extrinsic index to prevXtIndex
              prevXtIndex = extrinsicIndex

              return blockEvent
            }

            return new GenericEventWithId(event, eventBlockContext)
          })
        )
      }),
      share()
    )
  }
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
        const blockNumber = extrinsic.blockNumber
        const blockHash = extrinsic.blockHash
        const eventRecords: EventWithIdAndTx[] = []

        for (const [extrinsicPosition, event] of events.entries()) {
          const eventWithIdAndTx = new GenericEventWithIdAndTx(event, {
            blockNumber,
            blockHash,
            blockPosition: event.blockPosition,
            extrinsicPosition,
            extrinsicId: extrinsic.extrinsicId,
            extrinsic,
          }) as EventWithIdAndTx

          eventWithIdAndTx.extrinsic = extrinsic

          eventRecords.push(eventWithIdAndTx)
        }

        return eventRecords
      })
    )
  }
}
