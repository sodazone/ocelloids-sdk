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

import { Observable, shareReplay } from 'rxjs';

import type { Configuration } from '../configuration/index.js';
import type { ApiOptions } from '@polkadot/api/types';

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
    l.debug('Initialize Substrate APIs');

    Object.entries(config).forEach(([name, options]) => {
      const { provider } = options;

      if (provider === undefined) {
        throw new Error(`no provider specified for "${name}"`);
      }

      l.debug('-', name);

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
   * Returns the `ApiPromise` instance for a given chain name.
   *
   * ## Example
   * ```ts
   * // registered under 'polkadot' name
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
  get rx(): Record<string, Observable<ApiRx>> {
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const key = prop.toString();
        const res = target[key];
        if (res) {
          return res.isReady.pipe(shareReplay());
        }
        throw new Error(`${key} not found.`);
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