import type { Event } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, mergeMap, share } from 'rxjs';

import { extractTxWithEvents } from './extract.js';
import { flattenBatch } from './flatten.js';
import { mongoFilter, mongoFilterFrom } from './mongo-filter.js';
import { ControlQuery, Criteria } from '../index.js';

function isControlQuery(obj: ControlQuery | Criteria): obj is ControlQuery {
  return obj.change !== undefined;
}

/**
 * Returns an Observable that emits events filtered based on the provided criteria.
 *
 * @param eventsCriteria - Criteria for filtering events.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An Observable that emits Event objects that meet the filtering criteria.
 */
export function filterEvents(
  eventsCriteria: ControlQuery | Criteria,
  extrinsicsCriteria = {
    dispatchError: { $exists: false }
  }
) {
  const eventsQuery = isControlQuery(eventsCriteria)
    ? eventsCriteria
    : ControlQuery.from(eventsCriteria);

  return (source: Observable<SignedBlockExtended>)
    : Observable<Event> => {
    return (source.pipe(
      // Extract extrinsics with events
      extractTxWithEvents(),
      // Flatten batches if needed
      flattenBatch(),
      // Filter at extrinsic level
      // mainly for success or failure
      mongoFilterFrom(extrinsicsCriteria),
      // Map the related events
      mergeMap(x => x.events || []),
      // Filter over the events
      mongoFilter(eventsQuery),
      // Multicast
      share()
    ));
  };
}