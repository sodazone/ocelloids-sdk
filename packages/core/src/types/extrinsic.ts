import { Extrinsic, BlockNumber } from '@polkadot/types/interfaces';
import { Compact, GenericExtrinsic } from '@polkadot/types';
import type { SignedBlockExtended, TxWithEvent } from '@polkadot/api-derive/types';
import type { AnyJson } from '@polkadot/types-codec/types';

/**
 * Represents an extrinsic with additional identifier information.
 */
export interface ExtrinsicWithId extends Extrinsic {
  blockNumber: Compact<BlockNumber>,
  position: number,
  extrinsicId: string
}

/**
 * Represents a transaction with an additional identifier and event information.
 */
export interface TxWithIdAndEvent extends TxWithEvent {
  extrinsic: ExtrinsicWithId;
}

/**
 * A subclass of GenericExtrinsic that includes identifier information.
 */
export class GenericExtrinsicWithId extends GenericExtrinsic
  implements ExtrinsicWithId {
  blockNumber: Compact<BlockNumber>;
  position: number;

  constructor(
    blockNumber: Compact<BlockNumber>,
    position: number,
    value: GenericExtrinsic
  ) {
    super(value.registry, value.toU8a());
    this.blockNumber = blockNumber;
    this.position = position;
  }

  /**
   * Returns the unique identifier of the extrinsic.
   */
  get extrinsicId() {
    return `${this.blockNumber.toString()}-${this.position}`;
  }

  /**
   * Returns the JSON representation of the extrinsic with the added extrinsicId, blockNumber, and position properties.
   */
  toHuman(isExpanded?: boolean | undefined): AnyJson {
    return {
      extrinsicId: this.extrinsicId,
      blockNumber: this.blockNumber.toHuman(),
      position: this.position,
      ...(super.toHuman(isExpanded) as any)
    };
  }
}

/**
 * Enhances a transaction object with identifier information by wrapping the extrinsic with the GenericExtrinsicWithId class.
 * @param blockNumber The compact block number of the transaction.
 * @param position The position of the transaction within the block.
 * @param tx The transaction object to enhance.
 * @returns The enhanced transaction object with identifier information.
 */
export function enhanceTxWithId(
  blockNumber: Compact<BlockNumber>,
  position: number,
  tx: TxWithEvent
) : TxWithIdAndEvent {
  tx.extrinsic = new GenericExtrinsicWithId(blockNumber, position, tx.extrinsic);
  return tx as TxWithIdAndEvent;
}