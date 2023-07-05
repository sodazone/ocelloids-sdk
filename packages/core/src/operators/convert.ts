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

import type { AnyJson } from '@polkadot/types-codec/types';

import { Observable, map } from 'rxjs';

import { Converter, base } from '../converters/index.js';

/**
 * Maps the values emitted by the source observable to their named primitive representation.
 *
 * @typeparam T The type of values emitted by the source observable.
 * @param converter The converter to use, defaults to the base converter.
 * @returns A function that takes an observable source and returns an observable emitting the named primitive values as AnyJson.
 * @see {@link Converter}
 */
export function convert<T>(converter: Converter = base) {
  return (source: Observable<T>)
  : Observable<AnyJson> => {
    return source.pipe(
      map(record => converter.toNamedPrimitive(record))
    );
  };
}