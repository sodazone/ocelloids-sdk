// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

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
  return (source: Observable<T>): Observable<AnyJson> => {
    return source.pipe(map((record) => converter.toNamedPrimitive(record)));
  };
}
