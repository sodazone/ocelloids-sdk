// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { BlockNumber } from '@polkadot/types/interfaces';
import type { AnyJson, IU8a } from '@polkadot/types-codec/types';
import { Compact, GenericEvent } from '@polkadot/types';

import { EventBlockContext, EventWithId } from './interfaces.js';

/**
 * A subclass of GenericEvent that includes contextual information.
 */
export class GenericEventWithId extends GenericEvent
  implements EventWithId {
  blockNumber: Compact<BlockNumber>;
  blockHash: IU8a;
  extrinsicPosition: number;
  extrinsicId: string;

  constructor(
    value: GenericEvent,
    {
      blockNumber,
      blockHash,
      extrinsicPosition,
      extrinsicId
    }: EventBlockContext
  ) {
    super(value.registry, value.toU8a());
    this.blockNumber = blockNumber;
    this.blockHash = blockHash;
    this.extrinsicPosition = extrinsicPosition;
    this.extrinsicId = extrinsicId;
  }

  /**
   * Returns the unique identifier of the event.
   * The identifier is generated by combining the extrinsic ID and the position of the event within the extrinsic.
   * The identifier follows the format `<extrinsic-id>-<tx-position>`, where:
   * - `<extrinsic-id>` is the identifier of the extrinsic in which the event occurred.
   * - `<tx-position>` is the positional index of the event within the extrinsic, starting from 0.
   */
  get eventId() {
    return `${this.extrinsicId}-${this.extrinsicPosition}`;
  }

  /**
   * Returns the JSON representation of the extrinsic with the added extrinsicId,
   * blockNumber, and position within the extrinsic.
   */
  toHuman(isExpanded?: boolean | undefined): Record<string, AnyJson> {
    return {
      eventId: this.eventId,
      extrinsicId: this.extrinsicId,
      extrinsicPosition: this.extrinsicPosition,
      blockNumber: this.blockNumber.toHuman(),
      blockHash: this.blockHash.toHuman(),
      ...(super.toHuman(isExpanded) as any)
    };
  }
}