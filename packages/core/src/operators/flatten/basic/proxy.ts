import { MultiAddress } from '@polkadot/types/interfaces'
import type { Call } from '@polkadot/types/interfaces/runtime'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTx, getArgValueFromTx } from '../util.js'

export function extractProxyCalls(tx: TxWithIdAndEvent) {
  const { extrinsic } = tx
  const real = getArgValueFromTx(extrinsic, 'real') as MultiAddress
  const call = getArgValueFromTx(extrinsic, 'call') as Call

  return [
    callAsTx({
      call,
      tx,
      extraSigner: { type: 'proxied', address: real },
    }),
  ]
}
