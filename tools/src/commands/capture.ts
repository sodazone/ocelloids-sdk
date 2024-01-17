// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';

import { Observer } from 'rxjs';
import { encode } from 'cbor-x';

import { defineCommand } from 'citty';

import { WsProvider } from '@polkadot/api';
import { SignedBlockExtended } from '@polkadot/api-derive/types';

import { SubstrateApis, blocksInRange } from '@sodazone/ocelloids';
import { BinBlock } from '@sodazone/ocelloids-test';

function observer(outfile: string, apis: SubstrateApis)
: Observer<SignedBlockExtended> {
  const b : BinBlock[] = [];

  return {
    next: (block: SignedBlockExtended) => {
      const sblock = {
        block: block.toU8a(),
        events: block.events.map(ev => ev.toU8a()),
        author: block.author?.toU8a()
      };
      console.log('capture', block.block.header.number.toNumber());
      b.push(sblock);
    },
    error: (err: unknown) => console.error('Observer got an error: ' + err),
    complete: () => {
      apis.disconnect().then(() => console.log('APIs disconnected'));
      writeFileSync(outfile, encode(b));
    },
  };
}

function downloadBlocks({
  url,
  start,
  count,
  outfile
}: {
  url: string,
  start: string,
  count: string,
  outfile: string
}) {
  const apis = new SubstrateApis(
    {
      polkadot: {
        provider: new WsProvider(url)
      }
    }
  );

  const blocksPipe = blocksInRange(parseInt(start), parseInt(count));

  apis.rx.polkadot.pipe(
    blocksPipe
  ).subscribe(
    observer(outfile, apis)
  );
}

export default defineCommand({
  meta: {
    name: 'capture',
    description: 'Download extended signed blocks.',
  },
  args: {
    outfile: {
      type: 'positional',
      description: 'Output file name',
      required: true,
    },
    start: {
      default: '15950017',
      type: 'string'
    },
    count: {
      default: '1',
      type: 'string'
    },
    url: {
      default: 'wss://rpc.polkadot.io',
      type: 'string'
    },
  },
  run({ args }) {
    downloadBlocks(args);
  },
});
