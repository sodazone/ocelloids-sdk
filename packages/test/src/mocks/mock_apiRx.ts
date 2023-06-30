/* istanbul ignore file */

import { BN } from '@polkadot/util';
import { ApiRx } from '@polkadot/api';

import { Observable, from, of } from 'rxjs';
import { testBlocks, testEventRecords, testHeaders } from '../_blocks.js';

const apiMock = {
  rpc: {
    chain: {
      subscribeNewHeads: () => from(testHeaders),
      subscribeFinalizedHeads: () => from(testHeaders)
    },
  },
  query: {
    system: {
      events: () => from(testEventRecords)
    }
  },
  derive: {
    chain: {
      getBlockByNumber: (blockNumber: BN) =>  of(
        testBlocks.find(
          b => b.block.header.number.toBn().eq(blockNumber)
        )
      ),
      subscribeNewBlocks: () => from(testBlocks),
      subscribeFinalizedHeads: () => from(testHeaders),
      getBlock: (hash: Uint8Array | string) => of(
        testBlocks.find(
          b => b.block.hash.eq(hash)
        )
      )
    },
  },
} as unknown as ApiRx;

export const mockRxApi: Observable<ApiRx> = of(apiMock);
