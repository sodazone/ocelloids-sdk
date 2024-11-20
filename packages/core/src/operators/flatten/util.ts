// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { GenericCall, GenericExtrinsic } from '@polkadot/types'
import type { Vec, u16 } from '@polkadot/types-codec'
import type { AnyTuple, CallBase } from '@polkadot/types-codec/types'
import type { AccountId32, DispatchError, Event, FunctionMetadataLatest } from '@polkadot/types/interfaces'
import type { Address } from '@polkadot/types/interfaces/runtime'
import { isU8a, u8aToHex } from '@polkadot/util'
import { createKeyMulti } from '@polkadot/util-crypto'

import { ExtraSigner, GenericExtrinsicWithId } from '../../types/extrinsic.js'
import { ExtrinsicWithId, TxWithIdAndEvent } from '../../types/interfaces.js'
import { Boundary } from './correlated/flattener.js'

type CallContext = {
  call: CallBase<AnyTuple, FunctionMetadataLatest>
  tx: TxWithIdAndEvent
  boundary?: Boundary
  callError?: DispatchError
  extraSigner?: ExtraSigner
}

/**
 * Converts a nested call to a TxWithIdAndEvent.
 * Maps the call dispatch error and adds the extra signer if passed in the CallContext.
 *
 * @param call - The nested call to be converted.
 * @param context - The call context containing the original transaction, events, call error, and extra signer.
 * @returns The TxWithIdAndEvent, with updated extrinsic and dispatch error.
 */
export function callAsTxWithBoundary({ call, tx, boundary, callError, extraSigner }: CallContext) {
  const { extrinsic } = tx
  const flatCall = new GenericCall(extrinsic.registry, call)
  const { blockNumber, blockPosition, blockHash } = extrinsic
  const { signature } = extrinsic.inner

  const flatExtrinsic =
    typeof signature === 'object'
      ? new GenericExtrinsic(extrinsic.registry, {
          method: flatCall,
          signature,
        })
      : new GenericExtrinsic(extrinsic.registry, {
          method: flatCall,
        })

  const txWithId = new GenericExtrinsicWithId(
    flatExtrinsic,
    {
      blockNumber,
      blockHash,
      blockPosition,
    },
    extrinsic.extraSigners
  )

  if (extraSigner) {
    txWithId.addExtraSigner(extraSigner)
  }

  return {
    call: {
      ...tx,
      dispatchError: callError ? callError : tx.dispatchError,
      extrinsic: txWithId,
    },
    boundary,
  }
}

/**
 * Constructs a transaction with a flattened call and optional extra signer.
 *
 * This function creates a new extrinsic with the provided call and any extra signers,
 * incorporating additional information such as block number, position, and hash.
 *
 * @param ctx - The call context containing the call, transaction details, and optional extra signer.
 * @returns An object with the updated transaction, including the modified extrinsic.
 */
export function callAsTx({ call, tx, extraSigner }: CallContext) {
  const { extrinsic } = tx
  const flatCall = new GenericCall(extrinsic.registry, call)
  const { blockNumber, blockPosition, blockHash } = extrinsic
  const { signature } = extrinsic.inner

  const flatExtrinsic =
    typeof signature === 'object'
      ? new GenericExtrinsic(extrinsic.registry, {
          method: flatCall,
          signature,
        })
      : new GenericExtrinsic(extrinsic.registry, {
          method: flatCall,
        })

  const txWithId = new GenericExtrinsicWithId(
    flatExtrinsic,
    {
      blockNumber,
      blockHash,
      blockPosition,
    },
    extrinsic.extraSigners
  )

  if (extraSigner) {
    txWithId.addExtraSigner(extraSigner)
  }

  return {
    ...tx,
    extrinsic: txWithId,
  }
}

/**
 * Retrieves the value of an argument from an extrinsic.
 *
 * @param extrinsic - The input extrinsic.
 * @param name - The name of the argument to retrieve.
 * @returns The value of the specified argument.
 * @throws An error if the argument with the specified name is not found in the extrinsic.
 */
export function getArgValueFromTx(extrinsic: ExtrinsicWithId, name: string) {
  const { args, argsDef } = extrinsic.method
  const keys = Object.keys(argsDef)
  const indexOfData = keys.findIndex((k) => k === name)
  if (indexOfData !== -1) {
    return args[indexOfData]
  }
  throw new Error(`Extrinsic ${extrinsic.method.toHuman()} does not contain argument with name ${name}`)
}

/**
 * Generates a multisig address from the given extrinsic.
 *
 * @param extrinsic - The extrinsic containing the signer and other signatories.
 * @param threshold - (Optional) Number of required signatories. Defaults to the value from the extrinsic.
 * @returns The computed multisig address.
 */
export function getMultisigAddress(extrinsic: ExtrinsicWithId, threshold?: number) {
  const otherSignatories = getArgValueFromTx(extrinsic, 'other_signatories') as Vec<AccountId32>
  // Signer must be added to the signatories to obtain the multisig address
  const signatories = otherSignatories.map((s) => s.toString())
  signatories.push(extrinsic.signer.toString())
  const multisig = createKeyMulti(signatories, threshold ?? (getArgValueFromTx(extrinsic, 'threshold') as u16))
  const multisigAddress = extrinsic.registry.createTypeUnsafe('Address', [
    isU8a(multisig) ? u8aToHex(multisig) : multisig,
  ]) as Address
  return multisigAddress
}

/**
 * Retrieves the value of an argument from an event.
 *
 * @param event - The input vent.
 * @param name - The name of the argument to retrieve.
 * @returns The value of the specified argument.
 * @throws An error if the event does not have a list of data names or if the argument with the specified name is not found in the event.
 */
export function getArgValueFromEvent(event: Event, name: string) {
  const { names } = event.data
  if (!names) {
    throw new Error(`Event ${event.section}.${event.method} does not have list of data names`)
  }
  const indexOfData = names.findIndex((k) => k === name)
  if (indexOfData !== -1) {
    return event.data[indexOfData]
  }
  throw new Error(`Event ${event.section}.${event.method} does not contain argument with name ${name}`)
}

/**
 * Matches a given event to a single or multiple event names.
 * The event names include the section and the method concatenated by a dot.
 *
 * @param names - The full event names to match. Could be a string or an array of strings.
 * @param event - The event instance
 * @returns true if the event matches any of the event names.
 */
export function isEventType(names: string | string[], event: Event): boolean {
  return Array.isArray(names)
    ? names.includes(`${event.section}.${event.method}`)
    : names === `${event.section}.${event.method}`
}
