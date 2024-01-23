// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  Observable,
  concatMap
} from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { Flattener } from './extractors/flattener.js';

function withFlattener(tx: TxWithIdAndEvent) {
  const flattener = new Flattener(tx);
  flattener.flatten();
  return flattener.flattenedCalls;
}

/**
 * Operator to recursively flatten any nested calls in an extrinsic.
 *
 * Takes an `Observable<TxWithIdAndEvent>` as input and recursively checks for any nested calls.
 * Nested calls could originate from the multisig, proxy, utility, etc. pallets.
 * Additionally, correlates corresponding events and dispatch result to each extracted call.
 * Emits the input extrinsic plus all nested calls as individual TxWithIdAndEvent for easy filtering.
 *
 * <p>
 * Note: Only flattens executed or skipped calls.
 * Multisig call creation or approval are not flattened to avoid duplication when subscribing to filtered calls.
 * </p>
 */
export function flattenCalls() {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      concatMap(withFlattener)
    ));
  };
}