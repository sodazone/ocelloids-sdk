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

import { ApiPromise, ApiRx, HttpProvider, WsProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';

import { Observable, share } from 'rxjs';

import { Configuration } from '../configuration/index.js';
import { ApiOptions } from '@polkadot/api/types';

const l = logger('oc-substrate-apis');

/**
 * Substrate APIs wrapper with multi-chain support.
 */
export class SubstrateApis {
  private readonly chains: string[] = [];
  private readonly options: Record<string, ApiOptions> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  /**
   * @constructor
   * @param config The configuration instance
   */
  constructor(
    config: Configuration
  ) {
    l.log('Initialize Substrate APIs');

    Object.entries(config).forEach(([name, options]) => {
      l.log('- Register APIs for provider:', name, options);

      const { provider } = options;

      if (provider === undefined) {
        throw new Error('no provider specified');
      }

      this.options[name] = options;

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
    const promises = Object.entries(this.options).map(
      async ([_, opt]) =>  await opt.provider?.disconnect()
    );
    return Promise.all(promises).catch(l.error);
  }
}