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

import {
  testContractMetadata,
  testContractAddress,
  testContractBlocks,
} from '@sodazone/ocelloids-test';

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
          expect(found).toBeCalledTimes(1);
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
          expect(found).toBeCalledTimes(2);
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
          expect(found).toBeCalledTimes(2);
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
          expect(found).toBeCalledTimes(3);
        }
      });
    });
  });
});