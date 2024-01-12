/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
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
import * as path from 'node:path';
import { readFileSync } from 'node:fs';

import { decode } from 'cbor-x';

import { TypeRegistry, Metadata } from '@polkadot/types';
import metadataStatic from '@polkadot/types-support/metadata/static-polkadot';
import type { SignedBlock, EventRecord, Event, AccountId } from '@polkadot/types/interfaces';
import { createSignedBlockExtended } from '@polkadot/api-derive';
import type { TxWithEvent } from '@polkadot/api-derive/types';

import type { BinBlock } from './_types.js';

export function testBlocksFrom(file: string, mds: `0x${string}` = metadataStatic) {
  const buffer = readFileSync(path.resolve(__dirname, '__data__', file));
  const blocks: BinBlock[] = decode(buffer);

  const registry = new TypeRegistry() as any;
  const metadata = new Metadata(registry, mds);

  registry.setMetadata(metadata);

  return blocks.map(b => {
    const block = registry.createType('SignedBlock', b.block);
    const records = registry.createType('Vec<EventRecord>', b.events, true);
    const author = registry.createType('AccountId', b.author);

    return createSignedBlockExtended(
      registry,
      block as SignedBlock,
      records as unknown as EventRecord[],
      null,
      author as AccountId
    );
  });
}

export const testBlocks = testBlocksFrom('blocks.cbor.bin').slice(0, 3);
export const testHeaders = testBlocks.map(tb => tb.block.header);
export const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testEventRecords = testBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), []);
export const testEvents = testExtrinsics.reduce((acc: Event[], txt) => acc.concat(txt.events), []);

