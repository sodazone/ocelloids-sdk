// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import Worker from 'web-worker';

import { logger } from '@polkadot/util';

import { type Client, type ClientOptions, type Chain, QueueFullError, start } from 'smoldot';

import type { ScClient, AddChain, Chain as ScChain, Config as ScConfig, WellKnownChain } from '@substrate/connect';

const l = logger('oc-smoldot-worker');

const defaultLogger = (level: number, target: string, message: string) => {
  if (level === 1) {
    l.error(`[${target}] ${message}`);
  } else if (level === 2) {
    l.warn(`[${target}] ${message}`);
  } else if (level === 3) {
    l.log(`[${target}] ${message}`);
  } else if (level >= 4) {
    l.debug(`[${target}] ${message}`);
  }
};

type ExtConfig = ScConfig & {
  clientOptions?: ClientOptions;
};

// Regular expression to extract the property "id"
// from a JSON string. Note that 'g' makes it stateful.
const idRe = /"id"\s*:\s*"(.+)?"/gim;

// JSON-RPC callback function
type JsonRpcCallback = (msg: string) => void;

function getIdFromJSON(json: string): string | null {
  idRe.lastIndex = 0;
  const match = idRe.exec(json);
  return match === null ? match : match[1];
}

function getChainId(json: string): string {
  const chainId = getIdFromJSON(json);
  if (chainId === null) {
    throw new Error('Chain id not found in chain spec.');
  }
  return chainId;
}

/**
 * Create a worker thread and start the Smoldot client.
 *
 * @param options - Options for initializing the Smoldot client.
 * @returns A Smoldot {@link Client}.
 */
function startSmoldot(options?: ClientOptions): Client {
  const worker = new Worker.default(
    `
    // from "@substrate/connect/worker"
    const { parentPort } = require('node:worker_threads');
    const smoldot = require('smoldot/worker');
    const { compileBytecode } = require('smoldot/bytecode');
    
    compileBytecode().then(bytecode => parentPort.postMessage(bytecode));
    
    parentPort.once('message', data => {
      smoldot
        .run(data)
        .catch(error => console.error('[smoldot-worker]', error))
        .finally(() => process.exit());
    });
  `,
    {
      name: 'smoldot-worker',
      eval: true,
    }
  );

  const { port1, port2 } = new MessageChannel();
  worker.postMessage(port1, [port1 as unknown as MessagePort]);

  return start({
    ...options,
    portToWorker: port2,
  });
}

/**
 * Process JSON-RPC responses from a Substrate chain.
 *
 * @param chain - The Substrate chain.
 * @param jsonRpcCallback - Callback function to handle JSON-RPC responses.
 */
async function jsonRpcMessageLoop(chain: Chain, jsonRpcCallback: JsonRpcCallback) {
  let running = true;
  while (running) {
    let jsonRpcResponse;

    try {
      jsonRpcResponse = await chain.nextJsonRpcResponse();
    } catch {
      running = false;
      break;
    }

    try {
      jsonRpcCallback(jsonRpcResponse);
    } catch (error) {
      l.error('JSON-RPC callback', error);
    }
  }
}

/**
 * Create an alternative Substrate Connect client using Node.js worker threads.
 *
 * @returns A Substrate Connect client.
 */
export const createScClient = (config?: ExtConfig): ScClient => {
  const clientOptions = config?.clientOptions ?? {
    // 4 = debug, 2 = warning
    maxLogLevel: l.noop === l.debug ? 2 : 4,
    logCallback: defaultLogger,
  };

  const client = startSmoldot(clientOptions);

  const chains = new Map<string, Chain>();

  // Add a chain to Smoldot
  const addChain: AddChain = async (
    chainSpec: string,
    jsonRpcCallback?: JsonRpcCallback,
    databaseContent?: string
  ): Promise<ScChain> => {
    if (jsonRpcCallback === undefined) {
      throw new Error('JSON-RPC must be enabled.');
    }

    const chainId = getChainId(chainSpec);
    const chain = await client.addChain({
      chainSpec,
      potentialRelayChains: [...chains.values()],
      databaseContent,
    });

    chains.set(chainId, chain);

    // Start the JSON-RPC message loop for the chain
    jsonRpcMessageLoop(chain, jsonRpcCallback);

    return {
      sendJsonRpc: (msg: string) => {
        try {
          chain.sendJsonRpc(msg);
        } catch (error) {
          if (error instanceof QueueFullError) {
            jsonRpcCallback(
              JSON.stringify({
                jsonrpc: '2.0',
                id: getIdFromJSON(msg) ?? 'unknown',
                error: {
                  code: -32005, // non-std limit exceeded, std alt: -32603
                  message: 'The server is busy. Please try again later.',
                },
              })
            );
          } else {
            throw error;
          }
        }
      },
      remove: () => {
        try {
          chain.remove();
          chains.delete(chainId);
        } finally {
          if (chains.size === 0) {
            client.terminate();
          }
        }
      },
      addChain,
    };
  };

  // Return the Substrate Connect client
  return {
    addChain,
    addWellKnownChain: async (
      wellKnownChain: WellKnownChain,
      jsonRpcCallback?: JsonRpcCallback,
      databaseContent?: string
    ) => {
      const spec = await import('@substrate/connect-known-chains/' + wellKnownChain);
      return await addChain(await spec.chainSpec, jsonRpcCallback, databaseContent);
    },
  };
};
