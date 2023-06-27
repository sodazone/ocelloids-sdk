import type { FunctionMetadataLatest, Event } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import { GenericCall, GenericExtrinsic } from '@polkadot/types';

import { Observable, concatMap, share } from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { GenericExtrinsicWithId } from '../types/extrinsic.js';

type BatchEvents = Event[];

/**
 * Groups events into batches based on utility events.
 * Utility events with method 'ItemCompleted' indicate the end of a batch.
 * Utility events with method 'BatchCompleted' indicate the end of all batches.
 *
 * @param events - Array of events to be grouped into batches.
 * @returns An array of grouped event batches.
 */
function groupBatchEvents(events: Event[]): BatchEvents[] {
  const batches: BatchEvents[] = [];
  let batch: BatchEvents = [];

  for (const event of events) {
    if (event.section === 'utility' && event.method === 'BatchCompleted') {
      break;
    }

    batch.push(event);

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

  return batchTx.extrinsic.args.reduce((flattedTxWithEvent: TxWithIdAndEvent[], arg) => {
    const calls = arg as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

    const flatted = calls.map((call, index) => {
      const flatCall = new GenericCall(extrinsic.registry, call);
      const { blockNumber, blockPosition } = extrinsic;
      const flatExtrinsic = new GenericExtrinsic(extrinsic.registry, {
        method: flatCall,
        signature: extrinsic.inner.signature
      });
      return {
        ...batchTx,
        events: batchEvents[index],
        extrinsic: new GenericExtrinsicWithId(flatExtrinsic, {
          blockNumber,
          blockPosition
        })
      };
    });

    return flattedTxWithEvent.concat(flatted);
  }, [batchTx]);
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

        return flattenBatchCalls(tx);
      }),
      share()
    ));
  };
}

