import { ApiPromise, ApiRx, HttpProvider, WsProvider } from '@polkadot/api';
import type { Logger } from '@polkadot/util/types';

import { Observable, share } from 'rxjs';

import { Configuration } from '../conf/index.js';

/**
 * Substrate APIs wrapper with multi-chain support.
 */
export class SubstrateApis {
  private readonly chains: string[] = [];
  private readonly providers: Record<string, WsProvider | HttpProvider> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  /**
   * @constructor
   * @param config The configuration instance
   */
  constructor(
    config: Configuration,
    logger: Logger
  ) {
    logger.log('Initialize Substrate APIs');

    Object.entries(config.providers).forEach(([name, endpoint]) => {
      logger.log('- Register APIs for provider:', name, endpoint);

      if (endpoint.ws === undefined && endpoint.http === undefined) {
        throw new Error('please, provide a ws or http endpoint');
      }

      const provider = endpoint.ws ? new WsProvider(endpoint.ws) : new HttpProvider(endpoint.http);
      this.providers[name] = provider;

      this.apiRx[name] = new ApiRx({
        provider
      });

      this.promises[name] = new ApiPromise({
        provider
      });

      this.chains.push(name);
    });
  }

  /**
   * Returns the promise-based API instance for a given provider name.
   *
   * ## Example
   * ```ts
   * // provider registered under 'polkadot' name
   * apis.promise.polkadot.isReady
   * ```
   * @see ApiPromise
   */
  get promise(): Record<string, ApiPromise> {
    return new Proxy(this.promises, {
      get(target, prop) {
        const key = prop.toString();
        const res = target[key];
        if (res) {
          return res;
        }
        throw new Error(`${key} not found in registered api promise.`);
      }
    });
  }

  /**
   * Returns the rx-based API `isReady` observable for a given provider name.
   * The observable is shared.
   *
   * ## Example
   * ```ts
   * // provider registered under 'polkadot' name
   * apis.rx.polkadot
   * ```
   * @see ApiRx.isReady
   */
  get rx(): Record<string, Observable<ApiRx>> {
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const key = prop.toString();
        const res = target[key];
        if (res) {
          return res.isReady.pipe(share());
        }
        throw new Error(`${key} not found in registered api rx.`);
      }
    }) as unknown as Record<string, Observable<ApiRx>>;
  }

  /**
   * Returns a promise of diconnecting all the registered providers.
   */
  async disconnect() {
    const promises = Object.entries(this.providers).map(
      async ([_, provider]) =>  await provider.disconnect()
    );
    return Promise.all(promises);
  }
}