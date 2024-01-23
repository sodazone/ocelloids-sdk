// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import {
  extractAsDerivativeCall,
  extractBatchAllCalls,
  extractBatchCalls,
  extractForceBatchCalls
} from './utility.js';
import { extractAsMultiCall, extractAsMutiThreshold1Call } from './multisig.js';
import { extractProxyCalls } from './proxy.js';
import { Boundary, Flattener } from './flattener.js';

type Extractor = (tx: TxWithIdAndEvent, flattener: Flattener) => {
  call: TxWithIdAndEvent,
  boundary?: Boundary
}[]

/**
 * Extractors object which maps method signatures to their corresponding extractor functions.
 * Extractor functions take a transaction as input and return the nested call(s)
 * as an array of transactions, a single transaction, or undefined based on the extraction logic.
 */
export const extractors :  Record<string, Extractor> = {
  'proxy.proxy': extractProxyCalls,
  'proxy.proxyAnnounced': extractProxyCalls,
  'multisig.asMulti': extractAsMultiCall,
  'multisig.asMultiThreshold1': extractAsMutiThreshold1Call,
  'utility.batch': extractBatchCalls,
  'utility.batchAll': extractBatchAllCalls,
  'utility.forceBatch': extractForceBatchCalls,
  'utility.asDerivative': extractAsDerivativeCall
};
