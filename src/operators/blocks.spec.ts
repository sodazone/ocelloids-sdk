import { from, of, tap } from 'rxjs';
import { ApiRx } from '@polkadot/api';
import { DeriveApi, SignedBlockExtended } from '@polkadot/api-derive/types';
import { AnyNumber } from '@polkadot/types-codec/types';
import { mockBlocks } from '../__test__/blocks.js';

const mockDeriveApi = {
  derive: {
    chain: {
      getBlockByNumber: (blockNumber: AnyNumber) => of(mockBlocks.find(mb => mb.block.header.number.toNumber() === blockNumber)),
    }
  }
} as unknown as DeriveApi;

const mockRxApi = {
  isReady: from<Promise<ApiRx>>(
    new Promise((resolve): void => {
      resolve(mockDeriveApi as unknown as ApiRx);
    })
  ),
} as unknown as ApiRx;

jest.mock('@polkadot/api', () => {
  const original = jest.requireActual('@polkadot/api');

  return {
    ...original,
    ApiRx: jest.fn(() => mockRxApi),
    WsProvider: jest.fn(() => {
      return {
        hasSubscriptions: jest.fn(() => {return true;}),
        on: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn()
      }; })
  };
});

import { WsProvider } from '@polkadot/api';
import { SubstrateApis, blocksInRange } from '../index.js';

describe('blocks reactive operator', () => {
  let apis: SubstrateApis;

  beforeAll(() => {
    apis = new SubstrateApis({
      polkadot: {
        provider: new WsProvider('wss://polkadot.local.test')
      }
    },
    );
  });

  it('should stream new heads', () => {
    // new heads test
  });

  it('should stream blocks in defined range', (done) => {
    let index = 0;
    const testObserver = {
      next: (mockBlock: SignedBlockExtended) => {
        expect(mockBlock.block.header.number).toEqual(mockBlocks[index].block.header.number);
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