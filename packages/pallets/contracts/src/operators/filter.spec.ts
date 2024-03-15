// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  testContractMetadata,
  testContractAddress,
  testContractBlocks,
} from '@sodazone/ocelloids-sdk-test';

import { Abi } from '@polkadot/api-contract';

import { from } from 'rxjs';

import { filterContractCalls, filterContractEvents } from './filter.js';

describe('Contracts filter operator', () => {
  let testAbi: Abi;

  beforeAll(() => {
    testAbi = new Abi(testContractMetadata);
  });

  describe('filterContractCalls', () => {
    it('should filter contract messages according to criteria provided', () => {
      const found = jest.fn();

      const testPipe = filterContractCalls(
        testAbi,
        testContractAddress,
        {
          'message.identifier': 'transfer'
        }
      )(from(testContractBlocks));

      // Should only find the `transfer` call and not the `appprove` call
      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(1);
        }
      });
    });

    it('should work with no callsCriteria passed', () => {
      const found = jest.fn();

      const testPipe = filterContractCalls(
        testAbi,
        testContractAddress
      )(from(testContractBlocks));

      // Should find both `transfer` and `approve` calls
      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(2);
        }
      });
    });
  });

  describe('filterContractEvents', () => {
    it('should filter contract events according to criteria provided', () => {
      const found = jest.fn();

      const testPipe = filterContractEvents(
        testAbi,
        testContractAddress,
        {
          'event.identifier': 'Transfer'
        }
      )(from(testContractBlocks));

      // Should only find the `Transfer` events
      testPipe.subscribe({
        next: ev => {
          found();
          expect(ev).toBeDefined();
          expect(ev.event).toBeDefined();
          expect(ev.event.identifier).toBe('Transfer');
        },
        complete: () => {
          expect(found).toHaveBeenCalledTimes(2);
        }
      });
    });

    it('should work with no eventssCriteria passed', () => {
      const found = jest.fn();

      const testPipe = filterContractEvents(
        testAbi,
        testContractAddress
      )(from(testContractBlocks));

      // Should find both `Transfer` and `Approval` events
      testPipe.subscribe({
        next: found,
        complete: () => {
          expect(found).toHaveBeenCalledTimes(3);
        }
      });
    });
  });
});