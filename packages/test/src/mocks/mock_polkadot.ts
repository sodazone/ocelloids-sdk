/* istanbul ignore file */

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

if (typeof jest !== 'undefined') {
// Nested packages cannot be mocked by other means.
// @see https://github.com/jestjs/jest/issues/462
  jest.mock('@polkadot/util', () => {
    const original = jest.requireActual('@polkadot/util');

    return {
      ...original,
      logger: jest.fn(() => {
        return {
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          noop: jest.fn(),
        }; })
    };
  });

  jest.mock('@polkadot/api', () => {
    const original = jest.requireActual('@polkadot/api');

    return {
      ...original,
      WsProvider: jest.fn(() => {
        return {
          hasSubscriptions: jest.fn(() => {
            return true;
          }),
          on: jest.fn(),
          connect: jest.fn(),
          disconnect: jest.fn(),
          send: jest.fn(),
          subscribe: jest.fn(),
          unsubscribe: jest.fn()
        }; })
    };
  });
}