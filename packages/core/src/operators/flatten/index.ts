// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { TxWithIdAndEvent } from '../../types/interfaces.js'
import { Boundary, Flattener } from './flattener.js'
import { extractAsMultiCall, extractAsMutiThreshold1Call } from './multisig.js'
import { extractProxyCalls } from './proxy.js'
import { extractAsDerivativeCall, extractBatchAllCalls, extractBatchCalls, extractForceBatchCalls } from './utility.js'

/**
 * Type that represents an extractor function.
 */
type CallParser = (
  tx: TxWithIdAndEvent,
  flattener: Flattener
) => {
  call: TxWithIdAndEvent
  boundary?: Boundary
}[]

/**
 * Parsers object which maps method signatures to their corresponding extractor functions.
 * Extractor functions take a transaction as input and return the nested call(s)
 * as an array of transactions, a single transaction, or undefined based on the extraction logic.
 */
export const parsers: Record<string, CallParser> = {
  'proxy.proxy': extractProxyCalls,
  'proxy.proxyAnnounced': extractProxyCalls,
  'multisig.asMulti': extractAsMultiCall,
  'multisig.asMultiThreshold1': extractAsMutiThreshold1Call,
  'utility.batch': extractBatchCalls,
  'utility.batchAll': extractBatchAllCalls,
  'utility.forceBatch': extractForceBatchCalls,
  'utility.asDerivative': extractAsDerivativeCall,
}

/**
 * Returns a call parser matching the extrinsic call name or undefined.
 */
export function findParser({ extrinsic: { method } }: TxWithIdAndEvent): CallParser | undefined {
  return parsers[`${method.section}.${method.method}`]
}

/**
 * Returns true if a parser exists for the given extrinsic call name.
 */
export function hasParser(tx: TxWithIdAndEvent): boolean {
  return findParser(tx) !== undefined
}
