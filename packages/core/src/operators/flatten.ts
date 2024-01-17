// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  Observable,
  concatMap
} from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { extractors } from './extractors/index.js';

/**
 * Recursively flattens a transaction and any of its nested calls using a specified extractor.
 * Extractors are defined and matched by the pallet and method of the input transaction.
 * If no extractor is available, returns the input transaction in an array.
 *
 * @param tx - The input transaction.
 * @returns An array of flattened transactions.
 */
function flatten(tx: TxWithIdAndEvent): TxWithIdAndEvent[] {
  const acc = [tx];

  const {extrinsic: { method }} = tx;
  const methodSignature = `${method.section}.${method.method}`;
  const extractor = extractors[methodSignature];

  if (extractor) {
    const nestedCalls = extractor(tx);
    if (Array.isArray(nestedCalls)) {
      acc.push(...nestedCalls.flatMap(c => flatten(c)));
    } else if (nestedCalls) {
      acc.push(...flatten(nestedCalls));
    }
  }
  return acc;
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
      concatMap(flatten)
    ));
  };
}