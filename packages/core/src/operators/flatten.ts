import {
  Observable,
  concatMap
} from 'rxjs';

import { TxWithIdAndEvent } from '../types/interfaces.js';
import { extractors } from './extractors/index.js';

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
    return acc;
  }
  return [tx];
}

export function flattenCalls() {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<TxWithIdAndEvent> => {
    return (source.pipe(
      concatMap(flatten)
    ));
  };
}