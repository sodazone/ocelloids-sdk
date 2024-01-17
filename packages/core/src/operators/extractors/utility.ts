import type { FunctionMetadataLatest, Event, DispatchError } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import type { u16, u32 } from '@polkadot/types-codec';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithIdAndEvent } from './util.js';

type EventsGroup = Event[];

/**
 * Groups events of batch calls based on 'ItemCompleted' or 'ItemFailed' events.
 *
 * @param events - Array of events.
 * @returns An array of grouped event batches.
 */
function groupByBatchItem(events: Event[]) {
  const groups: EventsGroup[] = [];
  let group: EventsGroup = [];

  for (const event of events) {
    group.push(event);

    // Utility events with method 'ItemCompleted' or 'ItemFailed' indicate the end of a batch item.
    if (
      event.section === 'utility' &&
      ['ItemCompleted', 'ItemFailed'].includes(event.method)
    ) {
      groups.push(group);
      group = [];
    }
  }
  return groups;
}

/**
 * Groups events into batches based on utility batch events.
 * Takes into account the possibility of inner nested batch events
 * and correlates to the right batch.
 * The number of events batches should be equal to the number of calls in the batch.
 * The index of the event group corresponds to the index of the call in the batch.
 *
 * @param events - Array of events to be grouped.
 * @param numberOfCalls - The number of calls in the batch.
 * @returns An array of grouped event batches.
 */
function groupEventsForBatch(
  events: Event[],
  numberOfCalls: number
): EventsGroup[] {
  const groups = groupByBatchItem(events);

  const findNestedBatchIndex = (): number | undefined => {
    for (let index = groups.length - 1; index >= 0; index--) {
      const hasNestedBatch = groups[index].some(e =>
        e.section === 'utility' &&
      ['BatchCompleted', 'BatchInterrupted', 'BatchCompletedWithErrors'].includes(e.method)
      );
      if (hasNestedBatch) {
        return index;
      }
    }
    return undefined;
  };

  while (groups.length > numberOfCalls) {
    const indexToDelete = findNestedBatchIndex();
    if (indexToDelete !== undefined) {
      groups[indexToDelete - 1] = groups[indexToDelete - 1].concat(groups[indexToDelete]);
      groups.splice(indexToDelete, 1);
    }
  }

  return groups;
}

/**
 * Maps batch calls to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of nested batch calls.
 * @param tx - The original transaction.
 * @param batchEvents - Array of grouped event batches.
 * @returns An array of mapped batch calls as TxWithIdAndEvent.
 */
function mapBatchCalls(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchEvents: EventsGroup[] = []
) {
  return calls.map((call, i) =>
    callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: batchEvents.length <= i ? [] : batchEvents[i]
      }
    )
  );
}

/**
 * Maps batch completed calls to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchCompletedIndex - Index of the 'BatchCompleted' event in the events array.
 * @returns An array of mapped batch calls as TxWithIdAndEvent.
 */
function mapBatchCompleted(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchCompletedIndex: number
) {
  const { events } = tx;
  const batchEvents = groupEventsForBatch(
    events.slice(0, batchCompletedIndex),
    calls.length
  );
  return mapBatchCalls(calls, tx, batchEvents);
}

/**
 * Maps batch interrupted calls to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchInterruptedIndex - Index of the 'BatchInterrupted' event in the events array.
 * @returns An array of mapped batch calls as TxWithIdAndEvent.
 */
function mapBatchInterrupted(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchInterruptedIndex: number
) {
  const { events } = tx;
  const interruptedEvent = events[batchInterruptedIndex];
  const [callIndex, callError] = interruptedEvent.data as unknown as [u32, DispatchError];
  const interruptedIndex = callIndex.toNumber();
  const batchEvents = groupEventsForBatch(
    events.slice(0, batchInterruptedIndex),
    interruptedIndex
  );

  return calls.map((call, i) => {
    if (i < interruptedIndex) {
      // Executed
      return callAsTxWithIdAndEvent(
        call,
        {
          tx,
          events: batchEvents.length <= i ? [] : batchEvents[i]
        }
      );
    } else {
      // Failed or not executed
      return callAsTxWithIdAndEvent(
        call,
        {
          tx,
          events: [],
          callError
        }
      );
    }
  });
}

/**
 * Maps batch errored calls to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchErroredIndex - Index of the 'BatchCompletedWithErrors' event in the events array.
 * @returns An array of mapped batch calls as TxWithIdAndEvent.
 */
function mapBatchErrored(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchErroredIndex: number
) {
  const { events } = tx;
  const batchEvents = groupEventsForBatch(
    events.slice(0, batchErroredIndex),
    calls.length
  );

  return calls.map((call, i) => {
    const callItemEvents = batchEvents.length <= i ? [] : batchEvents[i];
    const itemFailedEvent = callItemEvents.find(e =>
      e.section === 'utility' && e.method === 'ItemFailed'
    );
    if (itemFailedEvent === undefined) {
      return callAsTxWithIdAndEvent(
        call,
        {
          tx,
          events: callItemEvents
        }
      );
    } else {
      return callAsTxWithIdAndEvent(
        call,
        {
          tx,
          events: callItemEvents,
          callError: itemFailedEvent.data[0] as DispatchError
        }
      );
    }
  });
}

/**
 * Extracts calls from an 'asDerivative' extrinsic.
 *
 * @param tx - The 'asDerivative' transaction.
 * @returns The extracted call as TxWithIdAndEvent.
 */
export function extractAsDerivativeCall(tx: TxWithIdAndEvent) {
  const [_, call] = tx.extrinsic.args as unknown as [u16, CallBase<AnyTuple, FunctionMetadataLatest>];

  return callAsTxWithIdAndEvent(
    call,
    {
      tx,
      events: tx.events
    }
  );
}

/**
 * Extracts calls from a 'utility.batch' extrinsic, handling 'BatchCompleted' and 'BatchInterrupted' events.
 * 'BatchCompleted' event is emitted if all items are executed succesfully, otherwise emits 'BatchInterrupted'
 *
 * @param tx - The 'utility.batch' transaction.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as TxWithIdAndEvent.
 */
export function extractBatchCalls(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

  if (events.length === 0) {
    return mapBatchCalls(calls, tx);
  }

  const batchCompletedIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'batchcompleted'
  );
  const batchInterruptedIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'batchinterrupted'
  );
  const isInterrupted = (batchInterruptedIndex !== -1 && batchCompletedIndex === -1) ||
    (batchInterruptedIndex !== -1 && batchCompletedIndex !== -1 && batchInterruptedIndex > batchCompletedIndex);

  if (isInterrupted) {
    return mapBatchInterrupted(calls, tx, batchInterruptedIndex);
  } else {
    return mapBatchCompleted(calls, tx, batchCompletedIndex);
  }
}

/**
 * Extracts calls from a 'BatchAll' extrinsic, handling 'BatchCompleted' event.
 * 'BatchCompleted' event is emitted if the whole batch executed succesfully,
 * otherwise returns extrinsic error and emits no batch events.
 *
 * @param tx - The 'utility.batchAll' transaction.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as TxWithIdAndEvent.
 */
export function extractBatchAllCalls(tx: TxWithIdAndEvent) {
  const { extrinsic, events, dispatchError } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

  if (dispatchError === undefined) {
    // If batch executed successfully, extract as normal batch complete calls
    const batchCompleteIndex = events.findLastIndex(
      e => e.method.toLowerCase() === 'batchcompleted'
    );

    return mapBatchCompleted(calls, tx, batchCompleteIndex);
  } else {
    // If batch failed, map inner calls with empty events
    return mapBatchCalls(calls, tx);
  }
}

/**
 * Extracts calls from a 'ForceBatch' extrinsic, handling 'BatchCompleted' and 'BatchCompletedWithErrors' events.
 * If executed all items successfully, will emit ItemCompleted for each item and BatchCompleted at the end.
 * If some items fails, will emit ItemFailed for failed items, ItemCompleted for successful items, and BatchCompletedWithErrors at the end.
 *
 * @param tx - The transaction with ID and events.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as TxWithIdAndEvent.
 */
export function extractForceBatchCalls(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

  if (events.length === 0) {
    return mapBatchCalls(calls, tx);
  }

  const batchCompleteIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'batchcompleted'
  );
  const batchErroredIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'batchcompletedwitherrors'
  );

  const isCompletedWithErrors = (batchErroredIndex !== -1 && batchCompleteIndex === -1) ||
    (batchErroredIndex !== -1 && batchCompleteIndex !== -1 && batchErroredIndex > batchCompleteIndex);

  if (isCompletedWithErrors) {
    return mapBatchErrored(calls, tx, batchErroredIndex);
  } else {
    return mapBatchCompleted(calls, tx, batchCompleteIndex);
  }
}
