// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  Observable,
  concatMap
} from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { Flattener } from './extractors/flattener.js';

function withFlattener(tx: TxWithIdAndEvent, keepOrder: boolean) {
  const flattener = new Flattener(tx);
  flattener.flatten();
  return keepOrder
    ? flattener.flattenedCalls.sort(
      (a: TxWithIdAndEvent, b: TxWithIdAndEvent) => {
        return (a.levelId ?? '0').localeCompare(b.levelId ?? '0');
      }
    )
    : flattener.flattenedCalls;
}

/**
 * Operator to recursively flatten any nested calls in an extrinsic.
 *
 * Takes an `Observable<TxWithIdAndEvent>` as input and recursively checks for any nested calls.
 * Nested calls could originate from the multisig, proxy, utility, etc. pallets.
 * Additionally, correlates corresponding events and dispatch result to each extracted call.
 * Emits the input extrinsic plus all nested calls as individual TxWithIdAndEvent for easy filtering.
 *
 * Note: Only flattens executed or skipped calls.
 * Multisig call creation or approval are not flattened to avoid duplication when subscribing to filtered calls.
 *
 * @param keepOrder - (Optional) preserve the order of nested calls. Defaults to true.
 */
export function flattenCalls(keepOrder = true) {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      concatMap(tx => withFlattener(tx, keepOrder))
    ));
  };
}