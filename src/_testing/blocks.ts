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

const blocksFileBuffer = readFileSync('./src/_testing/blocks.cbor.bin');
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

