/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { BlockNumber } from '@polkadot/types/interfaces';
import type { TxWithEvent } from '@polkadot/api-derive/types';
import { Compact } from '@polkadot/types';
import { GenericExtrinsicWithId } from './extrinsic.js';
import { GenericEventWithId } from './event.js';

/**
 * Represents an extrinsic with additional identifier information.
 */
export interface ExtrinsicWithId extends GenericExtrinsicWithId {
  blockNumber: Compact<BlockNumber>,
  blockPosition: number,
  extrinsicId: string
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
 * including the block number and the position of the extrinsic in the block.
 */
export interface ExtrinsicBlockContext {
  blockNumber: Compact<BlockNumber>;
  blockPosition: number;
}

/**
 * Represents the context of an event within a block, including the event's position within an extrinsic,
 * the ID of the extrinsic, the block number and the position of the event in the block.
 */
export interface EventBlockContext {
  blockNumber: Compact<BlockNumber>;
  extrinsicPosition: number,
  extrinsicId: string
}

