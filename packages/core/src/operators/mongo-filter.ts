import { logger } from '@polkadot/util';

import { Observable, filter } from 'rxjs';

import { RawObject } from 'mingo/types';

import { ControlQuery, Criteria } from '../index.js';
import { Converter, base } from '../converters/index.js';
import { debugOnly } from './debug.js';

const l = logger('oc-ops-mongo-filter');

/**
 * Applies a MongoDB query language filter to an observable stream of data.
 *
 * ## Example
 * ```ts
 * // Filter all blocks with `transferKeepAlive` calls from a block stream
 * apis.rx.polkadot.pipe(
 *   blocks(),
 *   mongoFilter(ControlQuery.from({
 *    'block.extrinsics.call.section': 'balances',
 *    'block.extrinsics.call.method': 'transferKeepAlive'
 *   }))
 * ).subscribe(x => console.log(`Block with transferKeepAlive ${x.block.hash.toHuman()}`))
 * ```
 *
 * To match nested objects, including collections refer to
 * {@link [dot notation](https://www.mongodb.com/docs/manual/core/document/#dot-notation)}
 * documentation for details.
 *
 * @param query The subject representing the query used for filtering.
 * @returns A function that takes an observable source and returns a filtered observable stream.
 * @see {@link ControlQuery}
 * @see {@link [Mongo Documentation](https://www.mongodb.com/docs/manual/tutorial/query-documents/)}
 */
export function mongoFilter<T>(
  criteria: Criteria | ControlQuery,
  converter: Converter = base
) {
  const query = ControlQuery.isControlQuery(criteria)
    ? criteria
    : ControlQuery.from(criteria as Criteria);

  /**
   * Returns a filtered observable stream based on the provided query.
   * @param source The observable source to be filtered.
   * @returns A filtered observable stream based on the query.
   */
  return (source: Observable<T>) => {
    // NOTE that we are not piping a subscription since
    // we do not want to reset the outter observables.
    // So, we just use the current value from the behavior subject.
    return source.pipe(
      filter(
        record => {
          const converted = converter.toNamedPrimitive(record);
          debugOnly(l, x => JSON.stringify(x, null, 2))(converted);
          return query.value.test(converted as RawObject);
        }
      )
    );
  };
}
