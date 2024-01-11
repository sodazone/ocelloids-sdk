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

import '@sodazone/ocelloids-test';

import { providerFromUrl } from './utils.js';

describe('configuration', () => {
  describe('configuration utils', () => {
    it('should resolve WS providers', () => {
      const wss = providerFromUrl('wss://some-rpc');
      const ws = providerFromUrl('ws://some-rpc');
      const mws = providerFromUrl(['ws://some-rpc', 'wss://another-rpc']);

      expect(wss).toBeDefined();
      expect(ws).toBeDefined();
      expect(mws).toBeDefined();
    });

    it('should resolve HTTP providers', () => {
      const https = providerFromUrl('http://some-rpc');
      const http = providerFromUrl('https://some-rpc');
      const mhttp = providerFromUrl(['http://some-rpc', 'https://another-rpc']);

      expect(https).toBeDefined();
      expect(http).toBeDefined();
      expect(mhttp).toBeDefined();
    });

    it('should fail on unknown URI scheme', () => {
      expect(() => {
        providerFromUrl('unk://some-rpc');
      }).toThrow();
    });
  });
});