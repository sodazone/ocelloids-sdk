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

import meow from 'meow';

import { WsProvider } from '@polkadot/api';
import { SignedBlockExtended } from '@polkadot/api-derive/types';

import { SubstrateApis, blocksInRange } from '@soda/ocelloids/src/index.js';
import { BinBlock } from '@soda/ocelloids/src/__test__/_types.js';

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

function downloadBlocks(outfile: string, {
  count,
  start,
  endpoint
}: {
  count: number,
  start: number,
  endpoint: string
}) {
  const apis = new SubstrateApis(
    {
      polkadot: {
        provider: new WsProvider(endpoint)
      }
    }
  );

  const blocksPipe = blocksInRange(start, count);

  apis.rx.polkadot.pipe(
    blocksPipe
  ).subscribe(
    observer(outfile, apis)
  );
}

const cli = meow(`
  Usage
    $ capture.ts <out file>

  Options
    --endpoint, -e  Websocket endpoint (wss://rpc.polkadot.io)
    --start, -s  Start block number (15950017)
    --count, -c  Number of blocks to fetch (10)

  Examples
    $ capture.ts ./out.bin
`, {
  importMeta: import.meta,
  description: 'Downloads extended signed blocks.',
  flags: {
    start: {
      default: 15950017,
      type: 'number',
      shortFlag: 's'
    },
    count: {
      default: 10,
      type: 'number',
      shortFlag: 'c'
    },
    endpoint: {
      default: 'wss://rpc.polkadot.io',
      type: 'string',
      shortFlag: 'e'
    }
  }
});

if (cli.input.length === 0) {
  cli.showHelp(1);
}

downloadBlocks(cli.input.at(0)!, cli.flags);
