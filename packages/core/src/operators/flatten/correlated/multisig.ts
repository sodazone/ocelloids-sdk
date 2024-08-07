// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { Null, Result } from '@polkadot/types-codec'
import { AccountId32, DispatchError } from '@polkadot/types/interfaces'
import type { Address, Call } from '@polkadot/types/interfaces/runtime'

import { TxWithIdAndEvent } from '../../../types/interfaces.js'
import { callAsTxWithBoundary, getArgValueFromEvent, getArgValueFromTx, getMultisigAddress } from '../util.js'
import { Boundaries, CorrelatedFlattener } from './flattener.js'

const MultisigExecuted = 'multisig.MultisigExecuted'
const MultisigExecutedBoundary = {
  eventName: MultisigExecuted,
}

/**
 * Extracts executed multisig calls from transactions.
 * Maps the execution result from 'MultisigExecuted' events to the extracted call and
 * adds the multisig address as an extra signer to the transaction.
 *
 * <p>
 * The `as_multi` method emits the 'MultisigExecuted' event when the threshold is met.
 * If the threshold is not met, it emits 'NewMultisig' for new multisig calls
 * or 'MultisigApproval' on the approval of a multisig call without meeting the threshold.
 * </p>
 *
 * @param tx - The input transaction to extract multisig calls from.
 * @returns The extracted multisig call as TxWithIdAndEvent.
 * Returns undefined if the 'MultisigExecuted' event is not found in the transaction events.
 */
export function extractAsMultiCall(tx: TxWithIdAndEvent, flattener: CorrelatedFlattener) {
  const { extrinsic } = tx

  const multisigExecutedIndex = flattener.findEventIndex(MultisigExecuted)

  if (multisigExecutedIndex === -1) {
    return []
  }

  const executedEvent = flattener.getEvent(multisigExecutedIndex)
  const callResult = getArgValueFromEvent(executedEvent, 'result') as Result<Null, DispatchError>
  const multisig = getArgValueFromEvent(executedEvent, 'multisig') as AccountId32
  const multisigAddress = extrinsic.registry.createTypeUnsafe('Address', [multisig.toHex()]) as Address

  const call = getArgValueFromTx(tx.extrinsic, 'call') as Call

  return [
    callAsTxWithBoundary({
      call,
      tx,
      boundary: MultisigExecutedBoundary,
      callError: callResult.isErr ? callResult.asErr : undefined,
      extraSigner: {
        type: 'multisig',
        address: multisigAddress,
      },
    }),
  ]
}

/**
 * Extracts directly executed multisig calls with a threshold of 1 from transactions.
 * Creates the multisig address from passed signatories and adds it as an extra signer to the transaction.
 *
 * <p>
 * Note: The `as_multi_threshold_1` method directly executes the multisig call without emitting the 'MultisigExecuted' event.
 * </p>
 *
 * @param tx - The input transaction to extract multisig calls from.
 * @returns The extracted multisig call as TxWithIdAndEvent.
 */
export function extractAsMutiThreshold1Call(tx: TxWithIdAndEvent) {
  const multisigAddress = getMultisigAddress(tx.extrinsic, 1)
  const call = getArgValueFromTx(tx.extrinsic, 'call') as Call

  return [
    callAsTxWithBoundary({
      call,
      tx,
      boundary: Boundaries.ALL,
      extraSigner: {
        type: 'multisig',
        address: multisigAddress,
      },
    }),
  ]
}
