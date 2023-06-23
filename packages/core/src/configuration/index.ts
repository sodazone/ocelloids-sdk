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

import { HttpProvider, WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import type { ApiOptions } from '@polkadot/api/types';

/**
 * The API configuration properties per chain.
 *
 * ## Example
 * ```ts
 * import { WsProvider } from '@polkadot/api';
 *
 * {
 *   polkadot: {
 *     provider: new WsProvider('wss://rpc.polkadot.io')
 *   },
 *   kusama: {
 *     provider: new WsProvider('wss://kusama-rpc.polkadot.io')
 *   }
 * }
 * ```
 */
export interface Configuration {
  [key: string]:  ApiOptions,
}

/**
 * Creates a provider based on the given endpoint URL.
 *
 * @param endpoint - The endpoint URL or an array of endpoint URLs.
 * @returns A provider instance.
 * @throws Error if the endpoint URL has an unknown URI scheme.
 */
export function providerFromUrl(endpoint: string | string[]) : ProviderInterface {
  const ep = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  if (ep.startsWith('ws')) {
    // WS Supports multiple endpoints
    return new WsProvider(endpoint);
  } else if (ep.startsWith('http')) {
    // For HTTP take the first URL
    return new HttpProvider(ep);
  }
  throw new Error(`Unknown URI scheme ${endpoint}`);
}

export * from './networks.js';
