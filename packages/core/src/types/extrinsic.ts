import { Extrinsic, BlockNumber } from '@polkadot/types/interfaces';
import { Compact, GenericExtrinsic } from '@polkadot/types';
import { AnyJson } from '@polkadot/types-codec/types';

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