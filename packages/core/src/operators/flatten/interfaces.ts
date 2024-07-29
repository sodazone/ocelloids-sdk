import { TxWithIdAndEvent } from '../../types/interfaces.js'

/**
 * Interface for extrinsic flatteners.
 */
export interface Flattener {
  flatten()
  get flattenedCalls(): TxWithIdAndEvent[]
}
