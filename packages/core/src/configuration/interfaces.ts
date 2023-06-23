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
