import type { Call } from '@polkadot/types/interfaces/runtime'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTx, getArgValueFromTx, getMultisigAddres } from '../util.js'

export function extractAsMultiCall(tx: TxWithIdAndEvent) {
  let extraSigner
  try {
    const multisigAddress = getMultisigAddres(tx.extrinsic)
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
