// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import '@sodazone/ocelloids-sdk-test';

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