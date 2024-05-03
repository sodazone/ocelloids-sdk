// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { createScClient } from './smoldot.js';

import Worker from 'web-worker';

function workerFactory(): Worker {
  // eslint-disable-next-line
  // @ts-ignore
  return new Worker('test');
}

jest.mock('web-worker', () => {
  return jest.fn().mockImplementation(() => ({
    postMessage: jest.fn(),
  }));
});

const mockAddChain = jest.fn();
const mockTerminate = jest.fn();
const options = {
  embeddedNodeConfig: {
    workerFactory,
  },
};

jest.mock('smoldot', () => {
  const original = jest.requireActual('smoldot');

  return {
    ...original,
    start: jest.fn(() => ({
      addChain: mockAddChain,
      terminate: mockTerminate,
    })),
  };
});

describe('smoldot provider', () => {
  beforeEach(() => {
    mockAddChain.mockReset();
  });

  it('should create the client', () => {
    const client = createScClient(options);
    expect(client).toBeDefined();
  });
  it('should add a chain', async () => {
    const rpc = jest.fn();
    const client = createScClient(options);
    const chain = await client.addChain('{"id":"xyz"}', rpc);
    expect(chain).toBeDefined();
    expect(mockAddChain).toHaveBeenCalledTimes(1);
  });
  it('should add multiple chains and pass the relays', async () => {
    mockAddChain.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3).mockReturnValueOnce(4);

    const rpc = jest.fn();
    const client = createScClient(options);

    await client.addChain('{"id":"abc"}', rpc);
    await client.addChain('{"id":"def"}', rpc);
    await client.addChain('{"id":"ghi"}', rpc);
    await client.addChain('{"id":"xyz"}', rpc);

    expect(mockAddChain).toHaveBeenCalledTimes(4);
    expect(mockAddChain).toHaveBeenLastCalledWith({
      chainSpec: '{"id":"xyz"}',
      databaseContent: undefined,
      potentialRelayChains: [1, 2, 3],
    });
  });

  it('should terminate when all chains are removed', async () => {
    mockAddChain.mockReturnValue({
      remove: () => {},
    });

    const rpc = jest.fn();
    const client = createScClient(options);
    const chains = [];

    const first = await client.addChain('{"id":"abc"}', rpc);
    chains.push(await client.addChain('{"id":"def"}', rpc));
    chains.push(await client.addChain('{"id":"ghi"}', rpc));
    chains.push(await client.addChain('{"id":"xyz"}', rpc));

    chains.forEach((chain) => chain.remove());

    expect(mockTerminate).not.toHaveBeenCalled();

    first.remove();

    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });
});
