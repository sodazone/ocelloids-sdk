import type { Event } from '@polkadot/types/interfaces';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, mergeMap, share } from 'rxjs';

import { extractTxWithEvents } from './extract.js';
import { flattenBatch } from './flatten.js';
import { mongoFilter, mongoFilterFrom } from './mongo-filter.js';
import { ControlQuery, Criteria } from '../index.js';
import { EventWithId, TxWithIdAndEvent } from '../types/interfaces.js';
import { GenericEventWithId } from '../types/event.js';

function isControlQuery(obj: ControlQuery | Criteria): obj is ControlQuery {
  return obj.change !== undefined;
}

function mapEventsWithContext() {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<EventWithId> => {
    return source.pipe(mergeMap(x => {
      const {
        extrinsicId, blockNumber, blockPosition
      } = (x as TxWithIdAndEvent).extrinsic;

      return (x.events || []).map(
        (event, extrinsicPosition) => {
          return new GenericEventWithId(event, {
            blockNumber,
            // TODO review block pos in event id, remove?
            blockPosition,
            extrinsicId,
            extrinsicPosition
          });
        }
      );
    }));
  };
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
    return source.pipe(
      // Extracts extrinsics with events
      extractTxWithEvents(),
      // Flattens batches if needed
      flattenBatch(),
      // Filters at the extrinsic level
      // mainly for success or failure
      mongoFilterFrom(extrinsicsCriteria),
      // Maps the events with
      // block and extrinsic context
      mapEventsWithContext(),
      // Filters over the events
      mongoFilter(eventsQuery),
      // Share multicast
      share()
    );
  };
}