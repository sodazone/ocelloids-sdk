// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { FunctionMetadataLatest, DispatchError } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import type { u16, u32 } from '@polkadot/types-codec';
import type { Result, Null } from '@polkadot/types-codec';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithBoundary, getArgValueFromTx, isEventType } from './util.js';
import { Boundaries, Flattener } from './flattener.js';

const MAX_BATCH_CALLS = 50;

const BatchCompleted = 'utility.BatchCompleted';
const BatchCompletedWithErrors = 'utility.BatchCompletedWithErrors';
const BatchInterrupted = 'utility.BatchInterrupted';
const ItemFailed = 'utility.ItemFailed';
const ItemCompleted = 'utility.ItemCompleted';
const DispatchedAs = 'utility.DispatchedAs';

const ItemFailedBoundary = {
  eventName: ItemFailed,
  offset: 1,
};
const ItemCompletedBoundary = {
  eventName: ItemCompleted,
  offset: 1,
};
const DispatchedAsBoundary = {
  eventName: DispatchedAs,
};

/**
 * Maps calls in an errored batch to an array of TxWithIdAndEvent.
 *
 * @param calls - Array of batch calls.
 * @param tx - The original transaction.
 * @param flattener - The {@link Flattener} instance.
 * @returns An array of batch calls mapped as {@link TxWithIdAndEvent}.
 */
function mapBatchErrored(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  flattener: Flattener
) {
  let from = flattener.nextPointer;

  return calls.map((call) => {
    const eventIndex = flattener.findEventIndex([ItemCompleted, ItemFailed], from);
    const event = flattener.getEvent(eventIndex);
    from = eventIndex + 1;

    if (isEventType(ItemFailed, event)) {
      return callAsTxWithBoundary({
        call,
        tx,
        boundary: ItemFailedBoundary,
        callError: event.data[0] as DispatchError,
      });
    }
    return callAsTxWithBoundary({
      call,
      tx,
      boundary: ItemCompletedBoundary,
    });
  });
}

/**
 * Extracts calls from an 'asDerivative' extrinsic.
 *
 * @param tx - The 'asDerivative' transaction.
 * @returns The extracted call as {@link TxWithIdAndEvent}.
 */
export function extractAsDerivativeCall(tx: TxWithIdAndEvent) {
  const [_, call] = tx.extrinsic.args as unknown as [u16, CallBase<AnyTuple, FunctionMetadataLatest>];

  return [
    callAsTxWithBoundary({
      call,
      tx,
      boundary: Boundaries.ALL,
    }),
  ];
}

/**
 * Extracts calls from a 'dispatchAs' extrinsic.
 * If call is executed with a 'DispatchedAs' event,
 * maps the execution result from the event to the extracted call.
 *
 * @param tx - The 'dispatchAs' transaction.
 * @param flattener - The {@link Flattener} instance.
 * @returns The extracted call as {@link TxWithIdAndEvent}.
 */
export function extractDispatchAsCall(tx: TxWithIdAndEvent, flattener: Flattener) {
  const { extrinsic, events } = tx;
  const call = getArgValueFromTx(extrinsic, 'call') as CallBase<AnyTuple, FunctionMetadataLatest>;

  const dispatchedAsIndex = flattener.findEventIndex(DispatchedAs);

  if (dispatchedAsIndex > -1) {
    const dispatchedAsEvent = events[dispatchedAsIndex];
    const [callResult] = dispatchedAsEvent.data as unknown as [Result<Null, DispatchError>];

    return [
      callAsTxWithBoundary({
        call,
        tx,
        boundary: DispatchedAsBoundary,
        callError: callResult.isErr ? callResult.asErr : undefined,
      }),
    ];
  } else {
    return [
      callAsTxWithBoundary({
        call,
        tx,
        boundary: Boundaries.ALL,
      }),
    ];
  }
}

function mapBatch(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  boundary = ItemCompletedBoundary
) {
  return calls.map((call) =>
    callAsTxWithBoundary({
      call,
      tx,
      boundary,
    })
  );
}

function mapBatchInterrupt(
  calls: CallBase<AnyTuple, FunctionMetadataLatest>[],
  tx: TxWithIdAndEvent,
  interruptIndex: number,
  callError: DispatchError
) {
  return calls.map((call, i) => {
    if (i < interruptIndex) {
      return callAsTxWithBoundary({
        call,
        tx,
        boundary: ItemCompletedBoundary,
      });
    } else {
      return callAsTxWithBoundary({
        call,
        tx,
        callError,
      });
    }
  });
}

/**
 * Extracts calls from a 'utility.batch' extrinsic, handling 'BatchCompleted' and 'BatchInterrupted' events.
 * 'BatchCompleted' event is emitted if all items are executed succesfully, otherwise emits 'BatchInterrupted'
 *
 * @param tx - The 'utility.batch' transaction.
 * @param flattener - The {@link Flattener} instance.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as {@link TxWithIdAndEvent}.
 */
export function extractBatchCalls(tx: TxWithIdAndEvent, flattener: Flattener) {
  const { extrinsic } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];
  if (calls.length > MAX_BATCH_CALLS) {
    throw new Error('Batch too large to process');
  }

  const batchCompletedIndex = flattener.findEventIndex(BatchCompleted);
  const batchInterruptedIndex = flattener.findEventIndex(BatchInterrupted);
  const isInterrupted =
    (batchCompletedIndex === -1 && batchInterruptedIndex > -1) ||
    (batchInterruptedIndex > -1 && batchInterruptedIndex < batchCompletedIndex);

  if (isInterrupted) {
    const interruptedEvent = flattener.getEvent(batchInterruptedIndex);
    const [callIndex, callError] = interruptedEvent.data as unknown as [u32, DispatchError];
    const interruptedIndex = callIndex.toNumber();
    return mapBatchInterrupt(calls, tx, interruptedIndex, callError);
  } else {
    return mapBatch(calls, tx);
  }
}

/**
 * Extracts calls from a 'BatchAll' extrinsic, handling 'BatchCompleted' event.
 * 'BatchCompleted' event is emitted if the whole batch executed succesfully,
 * otherwise returns extrinsic error and emits no batch events.
 *
 * @param tx - The 'utility.batchAll' transaction.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as {@link TxWithIdAndEvent}.
 */
export function extractBatchAllCalls(tx: TxWithIdAndEvent) {
  const { extrinsic, dispatchError } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];
  if (calls.length > MAX_BATCH_CALLS) {
    throw new Error('Batch too large to process');
  }

  if (dispatchError === undefined) {
    // If batch executed successfully, extract as normal batch complete calls
    return mapBatch(calls, tx);
  } else {
    // If batch failed, map inner calls with empty events
    return mapBatch(calls, tx, undefined);
  }
}

/**
 * Extracts calls from a 'ForceBatch' extrinsic, handling 'BatchCompleted' and 'BatchCompletedWithErrors' events.
 * If executed all items successfully, will emit ItemCompleted for each item and BatchCompleted at the end.
 * If some items fails, will emit ItemFailed for failed items, ItemCompleted for successful items, and BatchCompletedWithErrors at the end.
 *
 * @param tx - The transaction with ID and events.
 * @param flattener - The {@link Flattener} instance.
 * @returns The array of extracted batch calls
 * with correlated events and dispatch result as {@link TxWithIdAndEvent}.
 */
export function extractForceBatchCalls(tx: TxWithIdAndEvent, flattener: Flattener) {
  const { extrinsic } = tx;
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];
  if (calls.length > MAX_BATCH_CALLS) {
    throw new Error('Batch too large to process');
  }

  const batchCompletedIndex = flattener.findEventIndex(BatchCompleted);
  const batchErroredIndex = flattener.findEventIndex(BatchCompletedWithErrors);

  const isErrored =
    (batchCompletedIndex === -1 && batchErroredIndex > -1) ||
    (batchErroredIndex > -1 && batchErroredIndex < batchCompletedIndex);

  if (isErrored) {
    return mapBatchErrored(calls, tx, flattener);
  } else {
    return mapBatch(calls, tx);
  }
}
