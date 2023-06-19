import { Observable, Subject, filter, switchMap } from 'rxjs';
import { Query } from 'mingo';

import { toNamedPrimitive } from '../index.js';

/**
 * TBD Nested https://www.mongodb.com/docs/manual/core/document/#dot-notation
 *
 * @param query
 * @returns
 * @see https://www.mongodb.com/docs/manual/tutorial/query-documents/
 */
export function mongoFilter<T>(query: Subject<Query>) {
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