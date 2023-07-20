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

import { ApiPromise, ApiRx } from '@polkadot/api';
import { logger } from '@polkadot/util';

import { Observable, map, shareReplay } from 'rxjs';

import type { ApiNames, Configuration } from '../configuration/index.js';
import type { ApiOptions, QueryableStorage, QueryableStorageMulti } from '@polkadot/api/types';

const l = logger('oc-substrate-apis');

/**
 * Substrate APIs wrapper with multi-chain support.
 *
 * ## Example: Websocket Provider
 *
 * ```typescript
 * import { WsProvider } from '@polkadot/api';
 *
 * const apis = new SubstrateApis({
 *   polkadot: {
 *     provider: new WsProvider('wss://rpc.polkadot.io')
 *   }
 * });
 * ```
 *
 * ## Example: Substrate Connect Provider
 *
 * ```typescript
 * import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
 * import * as Sc from '@substrate/connect';
 *
 * const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);
 *
 * // Smoldot requires to manually connect,
 * // the promise is implicitly awaited by the rx pipe
 * provider.connect().catch(console.error);
 *
 * const apis = new SubstrateApis({
 *  polkadot: { provider }
 * });
 * ```
 */
export class SubstrateApis<C extends Configuration, N extends ApiNames<C>> {
  private readonly chains: string[] = [];
  private readonly options: Record<string, ApiOptions> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  /**
   * @constructor
   * @param config The configuration instance
   */
  constructor(
    config: C
  ) {
    l.debug('Initialize Substrate APIs');

    Object.entries(config).forEach(([name, options]) => {
      const { provider } = options;

      if (provider === undefined) {
        throw new Error(`no provider specified for "${name}"`);
      }

      l.debug('-', name);

      this.options[name] = options;

      this.chains.push(name);
    });
  }

  /**
   * Returns the `ApiPromise` instance for a given chain name.
   *
   * ## Example: Use isReady Promise
   * ```ts
   * // registered under 'polkadot' name
   * apis.promise.polkadot.isReady
   * ```
   *
   * ## Example: Fetch Chain Info
   * ```ts
   * apis.promise.polkadot.isReady.then(api => {
   *   const chainInfo = api.registry.getChainProperties();
   *   if (chainInfo === undefined) {
   *     throw new Error('Unable to retrieve chain info');
   *   }
   *   const { tokenDecimals, tokenSymbol } = chainInfo;
   *
   *   formatBalance.setDefaults({
   *     decimals: tokenDecimals.unwrapOrDefault().toArray().map(v => v.toNumber()),
   *     unit: tokenSymbol.unwrapOrDefault().toArray().map(v => v.toString())
   *   });
   * });
   *```
   *
   * @see ApiPromise
   */
  get promise(): Record<N, ApiPromise> {
    const opts = this.options;
    return new Proxy(this.promises, {
      get(target, prop) {
        const key = prop.toString();
        if (opts[key]) {
          // Lazy initialization
          if (!target[key]) {
            l.debug('init ApiPromise', key);
            target[key] = new ApiPromise(opts[key]);
            target[key].isReadyOrError
              .catch(error => l.error(error.message));
          }
          return target[key];
        }
        throw new Error(`${key} not found.`);
      }
    });
  }

  /**
   * Returns the reactive `ApiRx` observable for a given chain name.
   *
   * The returned observable is shared.
   *
   * ## Example
   * ```ts
   * // registered under 'polkadot' name
   * apis.rx.polkadot
   * ```
   * @see ApiRx.isReady
   */
  get rx(): Record<N, Observable<ApiRx>> {
    const opts = this.options;
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const key = prop.toString();
        if (opts[key]) {
          // Lazy initialization
          if (!target[key]) {
            l.debug('init ApiRx', key);
            target[key] = new ApiRx(opts[key]);
          }
          return target[key].isReady.pipe(shareReplay());
        }
        throw new Error(`${key} not found.`);
      }
    }) as unknown as Record<string, Observable<ApiRx>>;
  }

  /**
   * Returns an observable for querying the storage of a given chain name.
   *
   * ## Example
   *
   * ```typescript
   * apis.query.polkadot.pipe(
   *   switchMap(q => q.system.account(
   *     '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5'
   *   )),
   *   mongoFilter({
   *     'data.free': { $bn_lt: '6038009840776279' }
   *   })
   * ).subscribe(x => console.log('Account Balance:', x.toHuman()));
   * ```
   */
  get query()
    : Record<N, Observable<QueryableStorage<'rxjs'>>> {
    const opts = this.options;
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const key = prop.toString();
        if (opts[key]) {
          // Lazy initialization
          if (!target[key]) {
            l.debug('init ApiRx', key);
            target[key] = new ApiRx(opts[key]);
          }
          return target[key].isReady.pipe(
            map(api => api.query),
            shareReplay()
          );
        }
        throw new Error(`${key} not found.`);
      }
    }) as unknown as Record<N, Observable<QueryableStorage<'rxjs'>>>;
  }

  /**
   * Returns an observable for making multiple queries to the storage of a given chain name.
   */
  get queryMulti()
    : Record<N, Observable<QueryableStorageMulti<'rxjs'>>> {
    const opts = this.options;
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const key = prop.toString();
        if (opts[key]) {
          // Lazy initialization
          if (!target[key]) {
            l.debug('init ApiRx', key);
            target[key] = new ApiRx(opts[key]);
          }
          return target[key].isReady.pipe(
            map(api => api.queryMulti),
            shareReplay()
          );
        }
        throw new Error(`${key} not found.`);
      }
    }) as unknown as Record<N, Observable<QueryableStorageMulti<'rxjs'>>>;
  }

  /**
   * Returns a promise of diconnecting all the registered providers.
   */
  async disconnect() {
    const promises = Object.entries(this.options).map(
      async ([_, opt]) =>  await opt.provider?.disconnect()
    );
    return Promise.all(promises).catch(l.error);
  }
}
