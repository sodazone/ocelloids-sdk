// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types'

import { types } from '@sodazone/ocelloids-sdk'

/**
 * Represents a decoded contract message with associated extrinsic.
 */
export interface ContractMessageWithTx extends types.TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}

export type ContractConstructorWithTx = ContractMessageWithTx

/**
 * Represents a decoded contract event with the associated block event.
 */
export interface ContractEventWithBlockEvent extends DecodedEvent {
  blockEvent: types.EventWithId
}
