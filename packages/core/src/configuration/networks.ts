// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

/**
 * A list of well known RPC endpoints.
 *
 * @remark This list is not intended to be maintained, it is just for convinience.
 */
export const networks = {
  polkadot: ['wss://rpc.polkadot.io', 'wss://1rpc.io/dot'],
  kusama: ['wss://kusama-rpc.polkadot.io', 'wss://1rpc.io/ksm'],

  // Test networks
  westend: 'wss://westend-rpc.polkadot.io',
  rococo: 'wss://rococo-rpc.polkadot.io',
  rococoContracts: 'wss://rococo-contracts-rpc.polkadot.io',
}
