import { Observable, Subject, filter, switchMap } from 'rxjs';
import { Query } from 'mingo';

import { ControlQuery, Criteria, toNamedPrimitive } from '../index.js';

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
export function mongoFilter<T>(query: Subject<Query>) {
  /**
   * Returns a filtered observable stream based on the provided query.
   * @param source The observable source to be filtered.
   * @returns A filtered observable stream based on the query.
   */
  return (source: Observable<T>) => {
    return query.pipe(switchMap(q =>
      source.pipe(
        filter(
          record => q.test(
            toNamedPrimitive(record)
          )
        )
      )
    ));
  };
}

/**
 * Creates a MongoDB query language filter using the provided criteria.
 *
 * @param criteria The criteria used to construct the query filter.
 * @returns A function that takes an observable source and returns a filtered observable stream.
 * @see {@link mongoFilter}
 */
export function mongoFilterFrom<T>(criteria: Criteria) {
  return mongoFilter<T>(ControlQuery.from(criteria));
}