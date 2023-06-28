import type { BlockNumber, Event, Extrinsic } from '@polkadot/types/interfaces';
import type { TxWithEvent } from '@polkadot/api-derive/types';
import { Compact } from '@polkadot/types';

/**
 * Represents an extrinsic with additional identifier information.
 */
export interface ExtrinsicWithId extends Extrinsic {
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
export interface EventWithId extends Event {
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

