import { Extrinsic, BlockNumber } from '@polkadot/types/interfaces';
import { Compact, GenericExtrinsic } from '@polkadot/types';
import type { SignedBlockExtended, TxWithEvent } from '@polkadot/api-derive/types';
import type { AnyJson } from '@polkadot/types-codec/types';

/**
 *
 */
export interface ExtrinsicWithId extends Extrinsic {
  blockNumber: Compact<BlockNumber>,
  position: number,
  extrinsicId: string
}

/**
 *
 */
export interface TxIdWithEvent extends TxWithEvent {
  extrinsic: ExtrinsicWithId;
}

/**
 *
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
   *
   */
  get extrinsicId() {
    return `${this.blockNumber.toString()}-${this.position}`;
  }

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
 *
 * @param blockNumber
 * @param position
 * @param tx
 */
export function enhanceTxWithId(
  blockNumber: Compact<BlockNumber>,
  position: number,
  tx: TxWithEvent
) : TxIdWithEvent {
  tx.extrinsic = new GenericExtrinsicWithId(blockNumber, position, tx.extrinsic);
  return tx as TxIdWithEvent;
}