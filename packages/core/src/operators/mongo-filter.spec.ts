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

import { mockRxApi } from '@sodazone/ocelloids-test';
import { blocks } from '../index.js';
import { mongoFilter } from './mongo-filter.js';
import { ControlQuery } from '../subjects/query.js';

describe('control query', () => {
  it('should filter all non matching blocks', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilter(ControlQuery.from({
        'block.extrinsics.call.section': 'nope',
        'block.extrinsics.call.method': 'nope'
      }))
    ).subscribe(found);

    expect(found).not.toHaveBeenCalled;
  });

  it('should filter balance transfers', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilter(ControlQuery.from({
        'block.extrinsics.call.section': 'balances',
        'block.extrinsics.call.method': 'transferKeepAlive'
      }))
    ).subscribe(found);

    expect(found).toHaveBeenCalledTimes(1);
  });

  it('should filter balance transfers from criteria', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilter({
        'block.extrinsics.call.section': 'balances',
        'block.extrinsics.call.method': 'transferKeepAlive'
      })
    ).subscribe(found);

    expect(found).toHaveBeenCalledTimes(1);
  });
});