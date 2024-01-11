/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
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

import { ApiPromise } from '@polkadot/api';
import { Event } from '@polkadot/types/interfaces';

export const mockPromiseApi = {
  events: {
    contracts: {
      Instantiated: {
        is: (event: Event) => event.method === 'Instantiated'
          && event.section === 'contracts'
      }
    }
  },
  query: {
    contracts: {
      contractInfoOf: () => {}
    }
  }
} as unknown as ApiPromise;