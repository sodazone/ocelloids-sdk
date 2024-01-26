// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import type { ApiOptions, DecoratedEvents, QueryableStorage, QueryableStorageMulti, SubmittableExtrinsics } from '@polkadot/api/types';
import { ApiPromise, ApiRx, ScProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';

import { Observable, map, shareReplay } from 'rxjs';

import type { ApiNames, Configuration } from '../configuration/index.js';

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
 * const apis = new SubstrateApis({
 *  polkadot: { provider }
 * });
 * ```
 */
export class SubstrateApis<
C extends Configuration = Configuration,
N extends ApiNames<C> = ApiNames<Configuration>
> {
  private readonly options: Record<string, ApiOptions> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  readonly chains: string[] = [];

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

      if (provider instanceof ScProvider
        && !provider.isConnected) {
        // Smoldot requires to manually connect,
        // the promise is implicitly awaited by the rx pipe
        provider.connect().catch(error => {
          l.error(error);
        });
      }

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
   * Returns the submittable extrinsics for a named chain.
   */
  get tx(): Record<N, SubmittableExtrinsics<'rxjs'>> {
    return new Proxy(this, {
      get(target, prop) {
        const api = target.#proxyApiRx[prop.toString()];
        return api.tx;
      }
    }) as unknown as Record<string, SubmittableExtrinsics<'rxjs'>>;
  }

  /**
   * Returns the decorated events data for a named chain.
   *
   * ## Example: Typed Event Data
   *
   * ```ts
   * import type { } from '@polkadot/api-augment';
   *
   * // ...
   *
   * // Narrows down the event data type
   * if (apis.events.polkadot.balances.Transfer.is(event) ) {
   *   const transfer = event.data;
   *
   *   // Here we have typed data fields
   *   const from = transfer.from.toPrimitive();
   *   const to = transfer.to.toPrimitive();
   * }
   * ```
   */
  get events(): Record<N, DecoratedEvents<'rxjs'>> {
    return new Proxy(this, {
      get(target, prop) {
        const api = target.#proxyApiRx[prop.toString()];
        return api.events;
      }
    }) as unknown as Record<string, DecoratedEvents<'rxjs'>>;
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
    return new Proxy(this, {
      get(target, prop) {
        const api = target.#proxyApiRx[prop.toString()];
        return api.isReady.pipe(shareReplay());
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
    return new Proxy(this, {
      get(target, prop) {
        const api = target.#proxyApiRx[prop.toString()];
        return api.isReady.pipe(
          map(x => x.query),
          shareReplay()
        );
      }
    }) as unknown as Record<N, Observable<QueryableStorage<'rxjs'>>>;
  }

  /**
   * Returns an observable for making multiple queries to the storage of a given chain name.
   */
  get queryMulti()
    : Record<N, Observable<QueryableStorageMulti<'rxjs'>>> {
    return new Proxy(this, {
      get(target, prop) {
        const api = target.#proxyApiRx[prop.toString()];
        return api.isReady.pipe(
          map(x => x.queryMulti),
          shareReplay()
        );
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

  /**
   * Internal proxy to access named ApiRx instances.
   *
   * Provides lazy instantiation.
   */
  get #proxyApiRx() : Record<string, ApiRx> {
    return new Proxy(this, {
      get(target, prop) {
        const opts = target.options;
        const apiRx = target.apiRx;
        const key = prop.toString();
        if (opts[key]) {
          // Lazy initialization
          if (!apiRx[key]) {
            l.debug('init ApiRx', key);
            apiRx[key] = new ApiRx(opts[key]);
          }
          return apiRx[key];
        }
        throw new Error(`${key} not found.`);
      }
    }) as unknown as Record<string, ApiRx>;
  }
}

