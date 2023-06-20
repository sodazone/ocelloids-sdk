#!/usr/bin/env ts-node-esm
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

import { writeFileSync } from 'node:fs';

import { Observer } from 'rxjs';
import { encode } from 'cbor-x';

import { defineCommand, runMain } from 'citty';

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
  endpoint,
  start,
  count,
  outfile
}: {
  endpoint: string,
  start: string,
  count: string,
  outfile: string
}) {
  const apis = new SubstrateApis(
    {
      polkadot: {
        provider: new WsProvider(endpoint)
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

const main = defineCommand({
  meta: {
    name: 'capture',
    version: '0.0.1',
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
    endpoint: {
      default: 'wss://rpc.polkadot.io',
      type: 'string'
    },
  },
  run({ args }) {
    downloadBlocks(args);
  },
});

runMain(main as any);

