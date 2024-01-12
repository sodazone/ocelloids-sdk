import { TxWithIdAndEvent } from '../../types/interfaces.js';
import {
  extractAsDerivativeCall,
  extractBatchAllCalls,
  extractBatchCalls,
  extractForceBatchCalls
} from './utility.js';
import { extractAsMultiCall, extractAsMutiThreshold1Call } from './multisig.js';
import { extractProxyCalls } from './proxy.js';

type Extractor = (tx: TxWithIdAndEvent) => TxWithIdAndEvent[] | TxWithIdAndEvent | undefined

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
