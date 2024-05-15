// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { HttpProvider, WsProvider } from '@polkadot/api'
import { ProviderInterface } from '@polkadot/rpc-provider/types'

/**
 * Creates a provider based on the given endpoint URL.
 *
 * @param endpoint - The endpoint URL or an array of endpoint URLs.
 * @returns A provider instance.
 * @throws Error if the endpoint URL has an unknown URI scheme.
 */
export function providerFromUrl(endpoint: string | string[]): ProviderInterface {
  const ep = Array.isArray(endpoint) ? endpoint[0] : endpoint
  if (ep.startsWith('ws')) {
    // WS Supports multiple endpoints
    return new WsProvider(endpoint)
  } else if (ep.startsWith('http')) {
    // For HTTP take the first URL
    return new HttpProvider(ep)
  }
  throw new Error(`Unknown URI scheme ${endpoint}`)
}
