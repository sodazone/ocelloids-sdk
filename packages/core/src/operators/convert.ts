import { Observable, map } from 'rxjs';
import { Converter, base } from '../converters/index.js';

/**
 * Maps the values emitted by the source observable to their named primitive representation.
 *
 * @typeparam T The type of values emitted by the source observable.
 * @returns A function that takes an observable source and returns an observable that emits the named primitive values.
 * @see {@link toNamedPrimitive}
 */
export function convert<T>(converter: Converter = base) {
  return (source: Observable<T>) => {
    return source.pipe(
      map(record => converter.toNamedPrimitive(record))
    );
  };
}