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

/**
 * Creates a flattener instance based on the provided transaction and mode.
 *
 * If the mode is set to BASIC, or if the number of events in the transaction exceeds the maximum allowed,
 * a BasicFlattener is returned. Otherwise, a CorrelatedFlattener is used to support event correlation.
 *
 * @param tx - The transaction containing ID and associated events.
 * @param mode - The mode of flattening to use (BASIC or correlated).
 * @param maxEvents - The maximum number of events allowed for correlated flattening (defaults to DEFAULT_MAX_EVENTS).
 * @returns A Flattener instance appropriate for the given mode and transaction.
 */
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

/**
 * Determines if a transaction is nested based on the presence of a flattener parser for the extrinsic call.
 *
 * @param tx - The transaction to check.
 * @returns True if the transaction is nested, false otherwise.
 */
export function isNested(tx: TxWithIdAndEvent): boolean {
  return hasParser(tx)
}
