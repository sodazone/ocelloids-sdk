// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { AnyJson } from '@polkadot/types-codec/types'
/* istanbul ignore file */
import { Logger } from '@polkadot/util/types'

import { Observable, tap } from 'rxjs'

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
      l.debug(f ? f(x) : x)
    }
  }
}

/**
 * A pipeable operator that logs the values emitted by the source observable in debug mode.
 *
 * @param l The logger instance.
 * @param f An optional function to format the object before logging.
 * @returns A function that can be used as a pipeable operator in an observable chain.
 */
export function debug<T>(l: Logger, f?: (obj: T) => AnyJson) {
  const donly = debugOnly(l, f)
  return (source: Observable<T>) => {
    return source.pipe(tap(donly))
  }
}
