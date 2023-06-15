import { WsProvider, SubstrateApis, testBlocks } from '../__test__/mocks/mock_blocks.js';

import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { blocksInRange } from './blocks.js';

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider('wss://polkadot.local.test')
  }
});

describe('blocks reactive operator', () => {
  it('should stream new heads', () => {
    // new heads test
  });

  it('should stream blocks in defined range', (done) => {
    let index = 0;
    const testObserver = {
      next: (mockBlock: SignedBlockExtended) => {
        expect(mockBlock.block.header.number).toEqual(testBlocks[index].block.header.number);
        index++;
      },
      complete: () => done(),
    };

    apis.rx.polkadot.pipe(
      blocksInRange(15950017, 3)
    ).subscribe(
      testObserver
    );
  });
});