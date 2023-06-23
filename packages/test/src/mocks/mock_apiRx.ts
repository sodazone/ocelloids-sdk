/* istanbul ignore file */

import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord, Event } from '@polkadot/types/interfaces';
import type { FunctionMetadataLatest } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import { GenericCall } from '@polkadot/types';

import { BN } from '@polkadot/util';
import { ApiRx } from '@polkadot/api';

import { Observable, from, of } from 'rxjs';

import { testBlocksFrom } from '../_blocks.js';

export const testBlocks = testBlocksFrom('blocks.cbor.bin').slice(0, 3);
export const testHeaders = testBlocks.map(tb => tb.block.header);
export const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testEventRecords = testBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), []);
export const testEvents = testExtrinsics.reduce((acc: Event[], txt) => acc.concat(txt.events), []);
export const testBatchExtrinsic = testExtrinsics[5];
export const testBatchCalls = testBatchExtrinsic.extrinsic.args.reduce((flattedTxWithEvent: GenericCall[], arg) => {
  const calls = arg as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];

  const flatted = calls.map(call => {
    return new GenericCall(testBatchExtrinsic.extrinsic.registry, call);
  });

  return flattedTxWithEvent.concat(flatted);
}, []);

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
