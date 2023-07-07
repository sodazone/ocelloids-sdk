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
 *   },
 *   moonbeam: {
 *     noInitWarn: true,
 *     provider: new WsProvider('wss://wss.api.moonbeam.network')
 *   }
 * }
 * ```
 */
export interface Configuration {
  [key: string]:  ApiOptions,
}
