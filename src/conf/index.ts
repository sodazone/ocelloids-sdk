/**
 * Substrate provider configuration.
 *
 * ## Example
 * ```ts
 * {
 *   polkadot: {
 *     ws: 'wss://polkadot.local.test'
 *   },
 *   rococo: {
 *     ws: 'wss://rococo.local.test'
 *   }
 * }
 * ```
 */
export interface ProviderConfig {
  [key: string]: {
    ws?: string,
    http?: string
  }
}

/**
 * The configuration properties.
 *
 * ## Example
 * ```ts
 * {
 *   providers: {
 *     polkadot: {
 *       ws: 'wss://polkadot.local.test'
 *     },
 *     rococo: {
 *       ws: 'wss://rococo.local.test'
 *     }
 *   }
 * }
 * ```
 */
export interface Configuration {
  providers: ProviderConfig
}
