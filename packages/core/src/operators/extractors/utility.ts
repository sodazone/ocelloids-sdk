// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { FunctionMetadataLatest, Event, DispatchError } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import type { u16, u32 } from '@polkadot/types-codec';
import type { Result, Null } from '@polkadot/types-codec';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithIdAndEvent, getArgValueFromTx } from './util.js';

type EventsGroup = Event[];

/**
 * Groups events of batch items based on 'ItemCompleted' or 'ItemFailed' events.
 *
 * @param events - Array of events.
 * @returns An array of grouped events.
 */
function groupByBatchItem(events: Event[]) {
  const groups: EventsGroup[] = [];
  let group: EventsGroup = [];

  for (const event of events) {
    group.push(event);

    // Utility events with method 'ItemCompleted' or 'ItemFailed'
    // indicate the end of an event group for a batch item.
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
 * Groups events in a batch extrinsic to be correlated to the calls in the batch.
 * Ensures that events are properly grouped, considering the possibility of events in nested batch items
 * and guaranteeing that each event group corresponds to a call in the batch.
 *
 * @param events - Array of events to be grouped.
 * @param numberOfCalls - The number of calls in the batch.
 * @returns An array of grouped events where the index of the group
 * correlates to the index of the call in the batch.
 * @throws An error if the number of event groups does not correspond to the number of calls in a batch.
 */
function groupEventsForBatch(
  events: Event[],
  numberOfCalls: number
): EventsGroup[] {
  // Initial grouping based on 'ItemCompleted' or 'ItemFailed' events,
  // does not take into account possibility of nested batch calls
  const groups = groupByBatchItem(events);

  // Find the index of the last event group with events
  // that indicate a nested batch.
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

  // Merge event groups until the number of groups matches the number of calls
  while (groups.length > numberOfCalls) {
    const indexToDelete = findNestedBatchIndex();
    // Throw an error if no index is found, indicating an inconsistency in the number of events and calls
    if (indexToDelete === undefined) {
      throw new Error('Number of event groups does not correspond to number of calls in a batch.');
    }
    // Merge the nested batch events with the previous event group
    groups[indexToDelete - 1] = groups[indexToDelete - 1].concat(groups[indexToDelete]);
    groups.splice(indexToDelete, 1);
  }

  return groups;
}

/**
 * Maps calls in a batch to an array of TxWithIdAndEvent
 * and assigns the correlated events to the TxWithIdAndEvent.
 *
 * @param calls - Array of nested batch calls.
 * @param tx - The original transaction.
 * @param batchEvents - Array of grouped events.
 * @returns An array of batch calls mapped as TxWithIdAndEvent.
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
 * Maps calls in a completed batch to an array of TxWithIdAndEvent
 * and assigns the correlated events to the TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchCompletedIndex - Index of the 'BatchCompleted' event in the events array.
 * @returns An array of batch calls mapped as TxWithIdAndEvent.
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
 * Maps calls in a interrupted batch to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchInterruptedIndex - Index of the 'BatchInterrupted' event in the events array.
 * @returns An array of batch calls mapped as TxWithIdAndEvent.
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
      // Executed items
      return callAsTxWithIdAndEvent(
        call,
        {
          tx,
          events: batchEvents.length <= i ? [] : batchEvents[i]
        }
      );
    } else {
      // Failed or not executed items
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
 * Maps calls in an errored batch to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param batchErroredIndex - Index of the 'BatchCompletedWithErrors' event in the events array.
 * @returns An array of batch calls mapped as TxWithIdAndEvent.
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

  return [callAsTxWithIdAndEvent(
    call,
    {
      tx,
      events: tx.events
    }
  )];
}

/**
 * Extracts calls from a 'dispatchAs' extrinsic.
 * If call is executed with a 'DispatchedAs' event,
 * maps the execution result from the event to the extracted call.
 *
 * @param tx - The 'dispatchAs' transaction.
 * @returns The extracted call as TxWithIdAndEvent.
 */
export function extractDispatchAsCall(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;
  const call = getArgValueFromTx(extrinsic, 'call') as CallBase<AnyTuple, FunctionMetadataLatest>;

  const dispatchedAsIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'dispatchedAs'
  );

  if (dispatchedAsIndex !== -1) {
    const dispatchedAsEvent = events[dispatchedAsIndex];
    const [callResult] = dispatchedAsEvent.data as unknown as [Result<Null, DispatchError>];

    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events.slice(0, dispatchedAsIndex),
        callError: callResult.isErr ? callResult.asErr : undefined
      }
    );
  } else {
    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events
      }
    );
  }
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
