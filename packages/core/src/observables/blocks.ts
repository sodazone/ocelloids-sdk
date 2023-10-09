/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ApiPromise, ApiRx } from '@polkadot/api';
import { logger } from '@polkadot/util';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import type { Header } from '@polkadot/types/interfaces';

import { Observable, from, concatMap, mergeMap, share, switchMap } from 'rxjs';

import { AnyBN, bnRange } from '../observables/bn.js';
import { debug } from '../operators/debug.js';

const l = logger('oc-blocks');

// Copy of https://github.com/polkadot-js/api/blob/master/packages/api-derive/src/chain/subscribeFinalizedBlocks.ts
// because it is not exposed in the API
function subscribeFinalizedBlocks(api: ApiRx) {
  return api.derive.chain.subscribeFinalizedHeads().pipe(
    switchMap((header) =>
      api.derive.chain.getBlock(header.createdAtHash || header.hash)
    )
  );
}

/**
 * Returns an Observable that emits the latest new block headers or finalized block headers.
 *
 * @param finalized - (Optional) Whether to subscribe to finalized block headers.
 * When set to `true`, only finalized block headers are emitted.
 * When set to `false`, all new block headers are emitted.
 * Default is `false`.
 *
 * @returns An Observable of block headers.
 *
 * @see {@link finalizedHeads}
 */
export function heads(finalized = false) {
  return (source: Observable<ApiRx>)
  : Observable<Header> => {
    return (source.pipe(
      switchMap(api => {
        return finalized ?
          api.rpc.chain.subscribeFinalizedHeads() :
          api.rpc.chain.subscribeNewHeads();
      }),
      debug(l, header => header.number.toHuman()),
      share()
    ));
  };
}

/**
 * Returns an Observable that emits the latest finalized block headers.
 *
 * @returns An Observable of finalized block headers.
 *
 * @see {@link heads}
 */
export function finalizedHeads() {
  return heads(true);
}

/**
 * Returns an Observable that emits the latest new block or finalized block.
 *
 * @param finalized - (Optional) Whether to subscribe to finalized blocks.
 * When set to `true`, only finalized new blocks are emitted.
 * When set to `false`, all new blocks are emitted.
 * Default is `false`.
 *
 * ## Example
 * ```ts
 * // Subscribe to new blocks on Polkadot
 * apis.rx.polkadot.pipe(
 *   blocks()
 * ).subscribe(x => console.log(`New block on Polkadot has hash ${x.block.hash.toHuman()}`))
 * ```
 *
 * @see {@link finalizedBlocks}
 */
export function blocks(finalized = false) {
  return (source: Observable<ApiRx>)
  : Observable<SignedBlockExtended> => {
    return (source.pipe(
      switchMap(api => {
        return finalized ?
          subscribeFinalizedBlocks(api) :
          api.derive.chain.subscribeNewBlocks();
      }),
      debug(l, b => b.block.header.number.toHuman()),
      share()
    ));
  };
}

/**
 * Returns an Observable that emits the latest finalized blocks.
 *
 * ## Example
 *
 * ```ts
 * // Subscribe to finalized blocks on Polkadot
 * apis.rx.polkadot.pipe(
 *   finalizedBlocks()
 * ).subscribe(x => console.log(`New block on Polkadot has hash ${x.block.hash.toHuman()}`))
 * ```
 *
 * @see {@link blocks}
 */
export function finalizedBlocks() {
  return blocks(true);
}

/**
 * Returns an Observable that emits extended signed blocks from headers.
 *
 * @param {ApiPromise} api The promise API instance
 */
export function blockFromHeader(api: ApiPromise) {
  return (source: Observable<Header>)
  : Observable<SignedBlockExtended> => {
    return (source.pipe(
      mergeMap(header => {
        return from(api.derive.chain.getBlock(header.hash));
      })
    ));
  };
}

/**
 * Returns an Observable that emits blocks within a specified range.
 * By default, blocks are emitted sequentially,
 * but you can configure it to emit blocks in parallel for better performance.
 *
 * @param start - The starting block number.
 * @param count - The number of blocks to emit.
 * @param sorted - (Optional) Whether to emit blocks sequentially. Default is `true`.
 */
export function blocksInRange(
  start: AnyBN,
  count: AnyBN,
  sorted = true
) {
  return (source: Observable<ApiRx>)
  : Observable<SignedBlockExtended> => {
    return (source.pipe(
      switchMap(api =>
        bnRange(start, count).pipe(
          sorted ?
            concatMap(number =>
              api.derive.chain.getBlockByNumber(number)
            ) :
            mergeMap(number =>
              api.derive.chain.getBlockByNumber(number))
        )
      )
    ));
  };
}

