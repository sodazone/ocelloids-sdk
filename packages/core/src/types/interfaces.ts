import type { BlockNumber, Event, Extrinsic } from '@polkadot/types/interfaces';
import type { TxWithEvent } from '@polkadot/api-derive/types';
import { Compact } from '@polkadot/types';
import { DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

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
  blockPosition: number,
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

export interface BlockContext {
  blockNumber: Compact<BlockNumber>;
  blockPosition: number;
}

export interface EventBlockContext extends BlockContext {
  extrinsicPosition: number,
  extrinsicId: string
}

export interface ContractMessageWithTx
extends TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}

export interface ContractEventWithBlockEvent
extends DecodedEvent {
  blockEvent: EventWithId
}
