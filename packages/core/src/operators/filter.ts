import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, share } from 'rxjs';

import { extractEventsWithTx, extractTxWithEvents } from './extract.js';
import { flattenBatch } from './flatten.js';
import { mongoFilter, mongoFilterFrom } from './mongo-filter.js';
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
export function filterExtrinsics(
  extrinsicsCriteria: Criteria
) {
  return (source: Observable<SignedBlockExtended>)
    : Observable<TxWithIdAndEvent> => {
    return source.pipe(
      // Extracts extrinsics with events
      extractTxWithEvents(),
      // Flattens batches if needed
      flattenBatch(),
      // Filters at the extrinsic level
      // mainly for success or failure
      mongoFilterFrom(extrinsicsCriteria)
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