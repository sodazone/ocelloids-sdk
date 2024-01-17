// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { BlockNumber } from '@polkadot/types/interfaces';
import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { IU8a } from '@polkadot/types-codec/types';
import { Compact } from '@polkadot/types';
import { GenericExtrinsicWithId, Origin } from './extrinsic.js';
import { GenericEventWithId } from './event.js';

/**
 * Represents an extrinsic with additional identifier information.
 */
export interface ExtrinsicWithId extends GenericExtrinsicWithId {
  blockNumber: Compact<BlockNumber>,
  blockHash: IU8a,
  blockPosition: number,
  extrinsicId: string,
  origins: Origin[]
}

/**
 * Represents a transaction with an additional identifier and event information.
 */
export interface TxWithIdAndEvent extends TxWithEvent {
  extrinsic: ExtrinsicWithId;
}

/**
 * Represents an event with additional identifier information.
 */
export interface EventWithId extends GenericEventWithId {
  blockNumber: Compact<BlockNumber>,
  blockHash: IU8a,
  extrinsicPosition: number,
  extrinsicId: string,
  eventId: string
}

/**
 * Represents an event with additional block context and extrinsic information
 */
export interface EventWithIdAndTx extends EventWithId {
  extrinsic: ExtrinsicWithId
}

/**
 * Represents the context of an extrinsic in a block,
 * including the block number, the block hash and the position of the extrinsic in the block.
 */
export interface ExtrinsicBlockContext {
  blockNumber: Compact<BlockNumber>;
  blockHash: IU8a,
  blockPosition: number;
}

/**
 * Represents the context of an event within a block, including the event's position within an extrinsic,
 * the ID of the extrinsic, the block number, the block hash and the position of the event in the block.
 */
export interface EventBlockContext {
  blockNumber: Compact<BlockNumber>;
  blockHash: IU8a,
  extrinsicPosition: number,
  extrinsicId: string
}

