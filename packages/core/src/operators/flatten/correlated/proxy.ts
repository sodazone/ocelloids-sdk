// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { Null, Result } from '@polkadot/types-codec'
import { DispatchError, MultiAddress } from '@polkadot/types/interfaces'
import type { Call } from '@polkadot/types/interfaces/runtime'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTxWithBoundary, getArgValueFromTx } from '../util.js'
import { CorrelatedFlattener } from './flattener.js'

const ProxyExecuted = 'proxy.ProxyExecuted'
const ProxyExecutedBoundary = {
  eventName: ProxyExecuted,
}

/**
 * Extracts proxy calls from a transaction.
 * Maps the execution result from 'ProxyExecuted' event to the extracted call and
 * adds the proxied address as an extra signer to the transaction.
 *
 * @param tx - The input transaction to extract proxy calls from .
 * @returns The extracted proxy call as TxWithIdAndEvent.
 */
export function extractProxyCalls(tx: TxWithIdAndEvent, flattener: CorrelatedFlattener) {
  const { extrinsic } = tx
  const real = getArgValueFromTx(extrinsic, 'real') as MultiAddress
  const call = getArgValueFromTx(extrinsic, 'call') as Call

  const proxyExecutedIndex = flattener.findEventIndex(ProxyExecuted)

  if (proxyExecutedIndex === -1) {
    return []
  }

  const executedEvent = flattener.getEvent(proxyExecutedIndex)
  const [callResult] = executedEvent.data as unknown as [Result<Null, DispatchError>]

  return [
    callAsTxWithBoundary({
      call,
      tx,
      boundary: ProxyExecutedBoundary,
      callError: callResult.isErr ? callResult.asErr : undefined,
      extraSigner: { type: 'proxied', address: real },
    }),
  ]
}
