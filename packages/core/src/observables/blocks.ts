// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, ApiRx } from '@polkadot/api';
import { logger } from '@polkadot/util';

import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import type { Header } from '@polkadot/types/interfaces';

import { Observable, from, concatMap, mergeMap, share, switchMap } from 'rxjs';

import { AnyBN, bnRange } from '../observables/bn.js';
import { debug } from '../operators/debug.js';

const l = logger('oc-blocks');

// see https://github.com/polkadot-js/api/pull/5787
function subscribeFinalizedBlocks(api: ApiRx) {
  return api.derive.chain.subscribeFinalizedHeads().pipe(
    concatMap(header =>
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
 * @returns An Observable that emits blocks within the specified range.
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

