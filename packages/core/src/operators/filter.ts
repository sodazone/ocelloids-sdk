// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, share } from 'rxjs';

import { extractEventsWithTx, extractTxWithEvents } from './extract.js';
import { flattenCalls } from './flatten.js';
import { mongoFilter } from './mongo-filter.js';
import { ControlQuery, Criteria } from '../index.js';
import { EventWithIdAndTx, TxWithIdAndEvent } from '../types/interfaces.js';

/**
 * Filters extrinsics based on the provided criteria.
 *
 * This function extracts extrinsics with events from the given block,
 * optionally flattens batch calls, and applies the filter criteria.
 *
 * @param extrinsicsCriteria - The criteria to filter extrinsics.
 * @param flatten - (Optional) A flag indicating whether to flatten nested calls. Defaults to true.
 * @returns An observable that emits filtered extrinsics with identifier and event information.
 */
export function filterExtrinsics(
  extrinsicsCriteria: ControlQuery | Criteria,
  flatten: boolean = true
) {
  const xtQuery = ControlQuery.from(extrinsicsCriteria);

  return (source: Observable<SignedBlockExtended>)
    : Observable<TxWithIdAndEvent> => {
    return source.pipe(
      // Extracts extrinsics with events
      extractTxWithEvents(),
      // If the flatten flag is set to true,
      // pass through flattenCalls operator to recursively flatten
      // nested batch, multisig, proxy, etc. calls.
      // Else, pass through.
      flatten ?
        flattenCalls() :
        x => x,
      // Filters at the extrinsic level
      // mainly for success or failure
      mongoFilter(xtQuery)
    );
  };
}

/**
 * Returns an Observable that emits events filtered based on the provided criteria.
 *
 * This method allows filtering events based on both event-level criteria and extrinsic-level criteria.
 * Optionally, it flattens nested calls in extrinsics and applies the filtering criteria.
 *
 * @param eventsCriteria - Criteria for filtering events.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to an empty criteria.
 * E.g. `{ 'dispatchError': { $eq: undefined } }` to filter out failed extrinsics.
 * @param flatten - (Optional) A flag indicating whether to flatten nested calls.
 * Defaults to false to avoid duplication of filtered events.
 * When extrinsicCriteria is set for filtering of calls by method and section,
 * it is advisable to set the flatten flag to true to not miss nested calls.
 * @returns An Observable that emits `EventWithId` objects that meet the specified filtering criteria.
 */
export function filterEvents(
  eventsCriteria: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {},
  flatten: boolean = false
) {
  const eventsQuery = ControlQuery.from(eventsCriteria);

  return (source: Observable<SignedBlockExtended>)
    : Observable<EventWithIdAndTx> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria, flatten),
      // Maps the events with
      // block and extrinsic context
      extractEventsWithTx(),
      // Filters over the events
      mongoFilter(eventsQuery),
      // Share multicast
      share()
    );
  };
}