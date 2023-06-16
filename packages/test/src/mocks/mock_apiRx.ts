/* istanbul ignore file */

import { BN } from '@polkadot/util';
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
      getBlockByNumber: (blockNumber: BN) =>  of(
        testBlocks.find(
          b => b.block.header.number.toBn().eq(blockNumber)
        )
      )
    },
  },
} as unknown as ApiRx;

export const mockRxApi: Observable<ApiRx> = of(apiMock);
