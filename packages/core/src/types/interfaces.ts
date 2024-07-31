// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { TxWithEvent } from '@polkadot/api-derive/types'
import { Compact } from '@polkadot/types'
import type { u64 } from '@polkadot/types-codec'
import type { IU8a } from '@polkadot/types-codec/types'
import type { BlockNumber } from '@polkadot/types/interfaces'
import { GenericEventWithId } from './event.js'
import { ExtraSigner, GenericExtrinsicWithId } from './extrinsic.js'

/**
 * Represents an extrinsic with additional identifier information.
 */
export interface ExtrinsicWithId extends GenericExtrinsicWithId {
  blockNumber: Compact<BlockNumber>
  blockHash: IU8a
  blockPosition: number
  extrinsicId: string
  extraSigners: ExtraSigner[]
  timestamp?: u64
}

/**
 * Represents an event with additional identifier information and block context.
 */
export interface EventWithId extends GenericEventWithId {
  blockNumber: Compact<BlockNumber>
  blockHash: IU8a
  blockPosition: number
  eventId: string
  timestamp?: u64
}

/**
 * Represents a transaction with an additional identifier and event information.
 */
export interface TxWithIdAndEvent extends TxWithEvent {
  extrinsic: ExtrinsicWithId
  events: EventWithId[]
  levelId?: string
}

/**
 * Represents an event with additional block context and extrinsic information
 */
export interface EventWithIdAndTx extends EventWithId {
  extrinsicPosition: number
  extrinsicId: string
  extrinsic: ExtrinsicWithId
}

/**
 * Represents the context of an extrinsic in a block,
 * including the block number, the block hash and the position of the extrinsic in the block.
 */
export interface ExtrinsicBlockContext {
  blockNumber: Compact<BlockNumber>
  blockHash: IU8a
  blockPosition: number
  timestamp?: u64
}

/**
 * Represents the context of an event within a block,
 * including the position of the event in the block, the block number and the block hash.
 */
export interface EventBlockContext {
  blockNumber: Compact<BlockNumber>
  blockHash: IU8a
  blockPosition: number
  timestamp?: u64
}

/**
 * Represents the context of an event within an extrinsic, including the event's position within an extrinsic,
 * the ID of the extrinsic, the block number, the block hash and the position of the event in the block.
 */
export interface EventExtrinsicContext extends EventBlockContext {
  extrinsicPosition: number
  extrinsicId: string
  extrinsic: ExtrinsicWithId
  timestamp?: u64
}

/**
 * Represents an event in a block that could be either
 * an event associated to an extrinsic or an event without extrinsic.
 */
export interface BlockEvent extends EventWithId {
  extrinsicPosition?: number
  extrinsicId?: string
  extrinsic?: ExtrinsicWithId
}
