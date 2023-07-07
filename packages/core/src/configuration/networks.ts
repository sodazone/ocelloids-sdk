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
  rococoContracts: 'wss://rococo-contracts-rpc.polkadot.io'
};