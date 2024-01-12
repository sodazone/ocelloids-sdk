import type { FunctionMetadataLatest, Event, DispatchError } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import type { u16, u32 } from '@polkadot/types-codec';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithIdAndEvent } from './util.js';

type EventsGroup = Event[];

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
 * Checks for possible inner batch events see e.g. https://polkadot.subscan.io/event?extrinsic=16769534-2
 *
 * @param events - Array of events to be grouped into batches.
 * @returns An array of grouped event batches.
 */
function groupEventsByBatch(
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

function mapBatchCompleted(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchCompletedIndex: number
) {
  const { events } = tx;
  const batchEvents = groupEventsByBatch(
    events.slice(0, batchCompletedIndex),
    calls.length
  );
  return mapBatchCalls(calls, tx, batchEvents);
}

function mapBatchInterrupted(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchInterruptedIndex: number
) {
  const { events } = tx;
  const interruptedEvent = events[batchInterruptedIndex];
  const [callIndex, callError] = interruptedEvent.data as unknown as [u32, DispatchError];
  const interruptedIndex = callIndex.toNumber();
  const batchEvents = groupEventsByBatch(
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

function mapBatchErrored(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  batchErroredIndex: number
) {
  const { events } = tx;
  const batchEvents = groupEventsByBatch(
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

// `Batch` always returns extrinsic success.
// Emits BatchCompleted event if all items are executed succesfully, otherwise emits BatchInterrupted
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

// `BatchAll` returns extrinsic success and BatchCompleted event if the whole batch executed succesfully,
// otherwise returns extrinsic error and emits no event
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

// Always returns extrinsic success
// If executed all items successfully, will emit ItemCompleted for each item and BatchCompleted at the end
// If some items fails, will emit ItemFailed for failed items, ItemCompleted for successful items, and BatchCompletedWithErrors at the end
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
