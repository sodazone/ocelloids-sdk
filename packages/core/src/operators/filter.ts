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

import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, share } from 'rxjs';

import { extractEventsWithTx, extractTxWithEvents } from './extract.js';
import { flattenCalls } from './flatten.js';
import { mongoFilter } from './mongo-filter.js';
import { ControlQuery, Criteria } from '../index.js';
import { EventWithId, TxWithIdAndEvent } from '../types/interfaces.js';

/**
 * Filters extrinsics based on the provided criteria.
 *
 * It extracts extrinsics with events from the given block,
 * flattens batch calls if needed and applies the filter criteria.
 *
 * @param extrinsicsCriteria The criteria to filter extrinsics.
 * @returns An observable that emits filtered extrinsics with identifier and event information.
 */
export function filterExtrinsicsFlattened(
  extrinsicsCriteria: Criteria
) {
  return (source: Observable<SignedBlockExtended>)
    : Observable<TxWithIdAndEvent> => {
    return source.pipe(
      // Extracts extrinsics with events
      extractTxWithEvents(),
      // Flattens batches/multisig/proxy/derivative calls recursively
      flattenCalls(),
      // Filters at the extrinsic level
      // mainly for success or failure
      mongoFilter(extrinsicsCriteria)
    );
  };
}

/**
 * Filters extrinsics based on the provided criteria.
 *
 * It extracts extrinsics with events from the given block,
 * flattens batch calls if needed and applies the filter criteria.
 *
 * @param extrinsicsCriteria The criteria to filter extrinsics.
 * @returns An observable that emits filtered extrinsics with identifier and event information.
 */
export function filterExtrinsics(
  extrinsicsCriteria: Criteria
) {
  return (source: Observable<SignedBlockExtended>)
    : Observable<TxWithIdAndEvent> => {
    return source.pipe(
      // Extracts extrinsics with events
      extractTxWithEvents(),
      // Filters at the extrinsic level
      // mainly for success or failure
      mongoFilter(extrinsicsCriteria)
    );
  };
}

/**
 * Returns an Observable that emits events filtered based on the provided criteria.
 *
 * @param eventsCriteria - Criteria for filtering events.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An Observable that emits EventWithId objects that meet the filtering criteria.
 */
export function filterEvents(
  eventsCriteria: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {
    dispatchError: { $exists: false }
  }
) {
  const eventsQuery = ControlQuery.from(eventsCriteria);

  return (source: Observable<SignedBlockExtended>)
    : Observable<EventWithId> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria),
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