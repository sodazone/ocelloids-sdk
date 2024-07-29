import type { u16 } from '@polkadot/types-codec'

import type { AnyTuple, CallBase } from '@polkadot/types-codec/types'
import type { FunctionMetadataLatest } from '@polkadot/types/interfaces'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTx } from '../util.js'

export function extractAnyBatchCalls(tx: TxWithIdAndEvent) {
  const { extrinsic } = tx
  const calls = extrinsic.args[0] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[]
  return calls.map((call) =>
    callAsTx({
      call,
      tx,
    })
  )
}

export function extractAsDerivativeCall(tx: TxWithIdAndEvent) {
  const [_, call] = tx.extrinsic.args as unknown as [u16, CallBase<AnyTuple, FunctionMetadataLatest>]

  return [
    callAsTx({
      call,
      tx,
    }),
  ]
}
