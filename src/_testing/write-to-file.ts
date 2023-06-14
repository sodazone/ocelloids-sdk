import { writeFileSync } from 'fs';
import { Observer } from 'rxjs';
import { encode } from 'cbor-x';

import { SignedBlockExtended } from '@polkadot/api-derive/types';

import { SubstrateApis, blocksInRange } from '../index.js';
import { SBlock } from './types.js';

const apis = new SubstrateApis({
  providers: {
    polkadot: {
      ws: 'wss://rpc.polkadot.io'
    }
  },
});

const blocksPipe = blocksInRange(15950017, 10);

const b : SBlock[] = [];

const observer: Observer<SignedBlockExtended> = {
  next: (block: SignedBlockExtended) => {
    const sblock = {
      block: block.toU8a(),
      events: block.events.map(ev => ev.toU8a()),
      author: block.author?.toU8a()
    };
    b.push(sblock);
  },
  error: (err: unknown) => console.error('Observer got an error: ' + err),
  complete: () => {
    apis.disconnect().then(() => console.log('APIs disconnected'));
    writeFileSync('./blocks.cbor.bin', encode(b));
  },
};

apis.rx.polkadot.pipe(
  blocksPipe
).subscribe(
  observer
);