// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

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