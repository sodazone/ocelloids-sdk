/* istanbul ignore file */

import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { ApiRx } from '@polkadot/api';

import { Observable, from, of } from 'rxjs';

import { testBlocksFrom } from '../_blocks.js';

export const testBlocks = testBlocksFrom('blocks.cbor.bin');

export const testHeaders = testBlocks.map(tb => tb.block.header);

export const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);

export const testEvents = testBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), []);

const apiMock = {
  rpc: {
    chain: {
      subscribeNewHeads: () => from(testHeaders),
      subscribeFinalizedHeads: () => from(testHeaders)
    },
  },
  query: {
    system: {
      events: () => from(testEvents)
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
