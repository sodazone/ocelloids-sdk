import { readFileSync } from 'node:fs'
// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0
import * as path from 'node:path'

import { decode } from 'cbor-x'

import { createSignedBlockExtended } from '@polkadot/api-derive'
import type { TxWithEvent } from '@polkadot/api-derive/types'
import { Metadata, TypeRegistry } from '@polkadot/types'
import type { AccountId, Event, EventRecord, Extrinsic, SignedBlock } from '@polkadot/types/interfaces'

import metadataStatic from './__data__/metadata/polkadot-hex-18977445.js'
import type { BinBlock } from './_types.js'

export function testBlocksFrom(file: string, mds: `0x${string}` = metadataStatic) {
  const buffer = readFileSync(path.resolve(__dirname, '__data__', file))
  const blocks: BinBlock[] = decode(buffer)

  const registry = new TypeRegistry() as any
  const metadata = new Metadata(registry, mds)

  registry.setMetadata(metadata)

  return blocks.map((b) => {
    const block = registry.createType('SignedBlock', b.block)
    const records = registry.createType('Vec<EventRecord>', b.events, true)
    const author = registry.createType('AccountId', b.author)

    return createSignedBlockExtended(
      registry,
      block as SignedBlock,
      records as unknown as EventRecord[],
      null,
      author as AccountId
    )
  })
}

export function cloneExtrinsic(extrinsic: Extrinsic, mds: `0x${string}` = metadataStatic) {
  const registry = new TypeRegistry()
  const metadata = new Metadata(registry, mds)

  registry.setMetadata(metadata)

  return registry.createType('Extrinsic', extrinsic) as Extrinsic
}

export const testBlocks = testBlocksFrom('blocks.cbor.bin').slice(0, 3)
export const testHeaders = testBlocks.map((tb) => tb.block.header)
export const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), [])
export const testEventRecords = testBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), [])
export const testEvents = testExtrinsics.reduce((acc: Event[], txt) => acc.concat(txt.events), [])
