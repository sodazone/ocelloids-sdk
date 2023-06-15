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
import path from 'path';
import { readFileSync } from 'fs';
import { decode } from 'cbor-x';

import metadataStatic from '@polkadot/types-support/metadata/static-polkadot';
import { TypeRegistry, Metadata } from '@polkadot/types';
import { SignedBlock, EventRecord, AccountId } from '@polkadot/types/interfaces';
import { createSignedBlockExtended } from '@polkadot/api-derive';

import { SBlock } from './types.js';

const registry = new TypeRegistry();
const metadata = new Metadata(registry, metadataStatic);

registry.setMetadata(metadata);

const blocksFileBuffer = readFileSync(path.resolve(__dirname, '__data__/blocks.cbor.bin'));
const sBlocks: SBlock[] = decode(blocksFileBuffer);

const mockBlocks = sBlocks.map(sb => {
  const sBlock = registry.createType('SignedBlock', sb.block);
  const records = registry.createType('Vec<EventRecord>', sb.events, true);
  const author = registry.createType('AccountId', sb.author);

  return createSignedBlockExtended(
    registry,
    sBlock as SignedBlock,
    records as unknown as EventRecord[],
    null,
    author as AccountId
  );
});

export { mockBlocks };