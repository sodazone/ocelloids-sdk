jest.mock('@polkadot/api', () => {
  const original = jest.requireActual('@polkadot/api');

  return {
    ...original,
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

jest.mock('@polkadot/util', () => {
  const original = jest.requireActual('@polkadot/util');

  return {
    ...original,
    logger: jest.fn(() => {
      return {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        noop: jest.fn(),
      }; })
  };
});

import { SubstrateApis } from './substrate-apis.js';

describe('substrate APIs', () => {
  let apis: SubstrateApis;

  beforeAll(() => {
    apis = new SubstrateApis({
      providers: {
        polkadot: {
          ws: 'wss://polkadot.local.test'
        },
        rococo: {
          ws: 'wss://rococo.local.test'
        }
      },
    });
  });

  test('instantiate', () => {
    expect(apis).toBeDefined();
    expect(apis.promise).toBeDefined();
    expect(apis.rx).toBeDefined();
    expect(apis.promise.polkadot).toBeDefined();
    expect(apis.rx.polkadot).toBeDefined();
    expect(apis.promise.rococo).toBeDefined();
    expect(apis.rx.rococo).toBeDefined();
  });

  test('disconnect', async () => {
    // Cast as any to access private readonly property
    const polkadotProvider = (apis as any).providers['polkadot'] as any;
    const rococoProvider = (apis as any).providers['rococo'] as any;
    expect(polkadotProvider).toBeDefined();
    expect(rococoProvider).toBeDefined();

    // Call disconnect on all providers
    await apis.disconnect();

    expect(polkadotProvider.disconnect).toBeCalledTimes(1);
    expect(rococoProvider.disconnect).toBeCalledTimes(1);
  });
});
