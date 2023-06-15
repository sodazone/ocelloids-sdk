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
import path from 'node:path';

import { Observer } from 'rxjs';
import { encode } from 'cbor-x';

import { WsProvider } from '@polkadot/api';
import { SignedBlockExtended } from '@polkadot/api-derive/types';

import { SubstrateApis, blocksInRange } from '@soda/ocelloids/src/index.js';
import { BinBlock } from '@soda/ocelloids/src/__test__/types.js';

const apis = new SubstrateApis(
  {
    polkadot: {
      provider: new WsProvider('wss://rpc.polkadot.io')
    }
  }
);

const blocksPipe = blocksInRange(15950017, 10);

const b : BinBlock[] = [];

const observer: Observer<SignedBlockExtended> = {
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
    // XXX meow
    writeFileSync(path.resolve(__dirname, '../src/__test__/__data__/blocks.cbor.bin'), encode(b));
  },
};

apis.rx.polkadot.pipe(
  blocksPipe
).subscribe(
  observer
);