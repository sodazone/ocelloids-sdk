import { TxWithIdAndEvent } from '../../../types/interfaces.js'

import { extractAsMultiCall } from './multisig.js'
import { extractProxyCalls } from './proxy.js'
import { extractAnyBatchCalls, extractAsDerivativeCall } from './utility.js'

type CallParser = (tx: TxWithIdAndEvent) => TxWithIdAndEvent[]

const parsers: Record<string, CallParser> = {
  'proxy.proxy': extractProxyCalls,
  'proxy.proxyAnnounced': extractProxyCalls,
  'multisig.asMulti': extractAsMultiCall,
  'multisig.asMultiThreshold1': extractAsMultiCall,
  'utility.batch': extractAnyBatchCalls,
  'utility.batchAll': extractAnyBatchCalls,
  'utility.forceBatch': extractAnyBatchCalls,
  'utility.asDerivative': extractAsDerivativeCall,
}

export function findParser({ extrinsic: { method } }: TxWithIdAndEvent): CallParser | undefined {
  return parsers[`${method.section}.${method.method}`]
}
