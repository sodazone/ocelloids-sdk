/* istanbul ignore file */

import type { AnyNumber } from '@polkadot/types-codec/types';
import { ApiRx } from '@polkadot/api';

import { Observable, from, of } from 'rxjs';

import { testBlocksFrom } from '../_blocks.js';

export const testBlocks = testBlocksFrom('blocks.cbor.bin');

const apiMock = {
  rpc: {
    chain: {
      subscribeNewHeads: () => from(testBlocks)
    },
  },
  derive: {
    chain: {
      getBlockByNumber: (blockNumber: AnyNumber) => of(
        testBlocks.find(
          b => b.block.header.number.toNumber() === blockNumber
        )
      )
    },
  },
} as unknown as ApiRx;

export const mockRxApi: Observable<ApiRx> = of(apiMock);
