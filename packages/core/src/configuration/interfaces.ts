// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { ApiOptions } from '@polkadot/api/types'

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
  [key: string]: ApiOptions
}

/**
 * Configured API names type.
 *
 * @internal
 */
export type ApiNames<T extends Configuration> = keyof T & string
