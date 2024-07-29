import type { Call } from '@polkadot/types/interfaces/runtime'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTx, getArgValueFromTx, getMultisigAddress } from '../util.js'

export function extractAsMutiThreshold1Call(tx: TxWithIdAndEvent) {
  return extractMultisig(tx, 1)
}

export function extractAsMultiCall(tx: TxWithIdAndEvent) {
  return extractMultisig(tx)
}

function extractMultisig(tx: TxWithIdAndEvent, threshold?: number) {
  let extraSigner
  try {
    const multisigAddress = getMultisigAddress(tx.extrinsic, threshold)
    extraSigner = {
      type: 'multisig',
      address: multisigAddress,
    }
  } catch {
    //
  }
  const call = getArgValueFromTx(tx.extrinsic, 'call') as Call
  return [
    callAsTx({
      call,
      tx,
      extraSigner,
    }),
  ]
}
