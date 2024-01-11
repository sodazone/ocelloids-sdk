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

import { from } from 'rxjs';

import { testBlocks } from '@sodazone/ocelloids-test';
import { convert } from './convert.js';

describe('convert operator', () => {
  it('should convert an extended signed block', done => {
    convert()(from([testBlocks[0]]))
      .subscribe((c: any) => {
        expect(c).toBeDefined();
        expect(c.block.header.extrinsicsRoot)
          .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
        done();
      });
  });
});