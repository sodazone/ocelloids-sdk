import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { Flattener } from '../interfaces.js'
import { findParser } from './index.js'

/**
 * Flattens nested calls in the extrinsic without event correlation.
 * Supports all the extractors registered in the {@link parsers} map.
 */
export class BasicFlattener implements Flattener {
  private calls: TxWithIdAndEvent[]
  private tx: TxWithIdAndEvent

  constructor(tx: TxWithIdAndEvent) {
    this.tx = tx
    this.calls = []
  }

  flatten(id = '0') {
    this.tx.levelId = id
    this.calls.push(this.tx)

    const parser = findParser(this.tx)

    if (parser) {
      const nestedCalls = parser(this.tx)
      for (let i = nestedCalls.length - 1; i >= 0; i--) {
        this.tx = nestedCalls[i]
        this.flatten(`${id}.${i}`)
      }
    }
  }

  get flattenedCalls(): TxWithIdAndEvent[] {
    return this.calls
  }
}
