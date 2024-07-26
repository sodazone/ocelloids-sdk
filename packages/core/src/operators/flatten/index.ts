import { logger } from '@polkadot/util'

import { TxWithIdAndEvent } from '../../types/interfaces.js'

import { FlattenerMode } from '../flatten.js'
import { BasicFlattener } from './basic/flattener.js'
import { CorrelatedFlattener } from './correlated/flattener.js'
import { hasParser } from './correlated/index.js'
import { Flattener } from './index.js'

const l = logger('oc-ops-flattener')

const DEFAULT_MAX_EVENTS = 200

export * from './interfaces.js'

export function createFlattener(tx: TxWithIdAndEvent, mode: FlattenerMode, maxEvents = DEFAULT_MAX_EVENTS): Flattener {
  if (mode === FlattenerMode.BASIC) {
    return new BasicFlattener(tx)
  }

  if (tx.events.length > maxEvents) {
    l.warn(
      `Number of events (${tx.events.length}) in tx exceeds max limit of ${maxEvents}. Fallback to skip event correlation.`
    )
    return new BasicFlattener(tx)
  }

  return new CorrelatedFlattener(tx)
}

export function isNested(tx: TxWithIdAndEvent): boolean {
  return hasParser(tx)
}
