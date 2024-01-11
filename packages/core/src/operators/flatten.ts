/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
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

import { logger } from '@polkadot/util';
import type { FunctionMetadataLatest, Event } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import { GenericCall, GenericExtrinsic } from '@polkadot/types';

import { Observable, concatMap, share } from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { GenericExtrinsicWithId } from '../types/extrinsic.js';

type BatchEvents = Event[];

const l = logger('oc-ops-flatten');

/**
 * Groups events into batches based on utility batch events.
 *
 * @param events - Array of events to be grouped into batches.
 * @returns An array of grouped event batches.
 */
function groupBatchEvents(events: Event[]): BatchEvents[] {
  const batches: BatchEvents[] = [];
  let batch: BatchEvents = [];

  for (const event of events) {
    // Utility events with method 'BatchCompleted' indicate the end of all batches.
    if (event.section === 'utility' && event.method === 'BatchCompleted') {
      break;
    }

    batch.push(event);

    // Utility events with method 'ItemCompleted' indicate the end of a batch.
    if (event.section === 'utility' && event.method === 'ItemCompleted') {
      batches.push(batch);
      batch = [];
    }
  }

  return batches;
}

/**
 * Extracts underlying calls of a batch extrinsic and creates individual extrinsics for each call.
 * Maps corresponding events to each flattened extrinsic to recompose as TxWithEvent.
 *
 * @param batchTx - An extrinsic that makes either a `utility.batch` or `utility.batchAll` call.
 * @returns An array of individual transactions with corresponding events.
 */
function flattenBatchCalls(batchTx: TxWithIdAndEvent): TxWithIdAndEvent[] {
  const { extrinsic, events } = batchTx;
  const batchEvents = groupBatchEvents(events);
  // We assume that batch events are always emitted first
  const batchCompleteIndex = events.findIndex(
    e => e.method.toLowerCase() === 'batchcompleted'
  );
  const outerTxEvents = events.slice(batchCompleteIndex);

  return batchTx.extrinsic.args.reduce(
    (flattedTxWithEvent: TxWithIdAndEvent[], arg) => {
      const calls = arg as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

      l.debug('calls in batch', calls.length);

      const flatted = calls.map((call, index) => {
        const flatCall = new GenericCall(extrinsic.registry, call);
        const { blockNumber, blockPosition, blockHash } = extrinsic;
        const flatExtrinsic = new GenericExtrinsic(extrinsic.registry, {
          method: flatCall,
          signature: extrinsic.inner.signature
        });
        return {
          ...batchTx,
          events: batchEvents[index],
          extrinsic: new GenericExtrinsicWithId(flatExtrinsic, {
            blockNumber,
            blockHash,
            blockPosition
          })
        };
      });

      return flattedTxWithEvent.concat(flatted);
    }, [{
      extrinsic,
      events: outerTxEvents
    }]);
}

/**
 * Operator to flatten batch transactions into individual transactions.
 * Takes an `Observable<TxWithEvent>` as input and emits an array of individual transactions with corresponding events.
 *
 * @returns An Observable that emits flattened transactions with corresponding events.
 */
export function flattenBatch() {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      concatMap(tx => {
        const { method } = tx.extrinsic;
        const isBatch = method.section === 'utility' &&
          (method.method === 'batch' || method.method === 'batchAll');

        if (!isBatch) {
          return [tx];
        }

        l.debug('flatten batch calls');

        return flattenBatchCalls(tx);
      }),
      share()
    ));
  };
}

