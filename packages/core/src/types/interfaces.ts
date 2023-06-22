import type { BlockNumber, Event, EventRecord, Extrinsic, Header, SignedBlock } from '@polkadot/types/interfaces';
import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { AnyJson } from '@polkadot/types-codec/types';
import { Compact, GenericEvent } from '@polkadot/types';

/**
 * Represents an event with additional identifier information.
 */
export interface EventWithId extends Event {
  blockNumber: Compact<BlockNumber>,
  blockPos: number,
  extrinsicPos: number,
  extrinsicId: string,
  eventId: string
}

/**
 * Represents an event record with an additional identifier.
 */
export interface EventRecordWithId extends EventRecord {
  event: EventWithId;
}

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

export interface BlockContext {
  blockNumber: Compact<BlockNumber>;
  blockPosition: number;
}

export interface EventBlockContext extends BlockContext {
  extrinsicPosition: number,
  extrinsicId: string
}