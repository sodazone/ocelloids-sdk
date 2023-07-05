/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
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

/* istanbul ignore file */
import { Logger } from '@polkadot/util/types';
import type { AnyJson } from '@polkadot/types-codec/types';

import { Observable, tap } from 'rxjs';

/**
 * A utility function that logs the provided object only in debug mode.
 *
 * @param l The logger instance.
 * @param f An optional function to format the object before logging.
 * @returns A function that logs the object when called.
 */
export function debugOnly<T>(l: Logger, f?: (obj: T) => AnyJson) {
  return (x: T) => {
    // When disabled is noop()
    if (l.noop !== l.debug) {
      l.debug(f ? f(x) : x);
    }
  };
}

/**
 * A pipeable operator that logs the values emitted by the source observable in debug mode.
 *
 * @param l The logger instance.
 * @param f An optional function to format the object before logging.
 * @returns A function that can be used as a pipeable operator in an observable chain.
 */
export function debug<T>(l: Logger, f?: (obj: T) => AnyJson) {
  const donly = debugOnly(l, f);
  return (source: Observable<T>) => {
    return source.pipe(
      tap(donly)
    );
  };
}
