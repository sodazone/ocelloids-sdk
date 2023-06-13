import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { Observable, share } from 'rxjs';

import { logger } from '../log/index.js';
import { Configuration } from '../conf/index.js';

/**
 * Substrate APIs wrapper with multi-chain support.
 */
export class SubstrateApis {
  private readonly chains: string[] = [];
  private readonly providers: Record<string, WsProvider> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  /**
   * @constructor
   * @param config The configuration instance
   */
  constructor(
    config: Configuration
  ) {
    logger.info('Initialize Substrate APIs');

    config.providers.forEach((ws: string, name: string) => {
      logger.info('- Register APIs for provider: [%s, %s]', name, ws);

      const provider = new WsProvider(ws);
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