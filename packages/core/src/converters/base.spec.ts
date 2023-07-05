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

import { testBlocks, testBlocksFrom } from '@sodazone/ocelloids-test';

import { base } from './base.js';

describe('substrate converters', () => {
  it('should convert an extended signed block', () => {
    const b = testBlocks[0];
    const c = base.toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.block.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert a block with justifications', () => {
    const b = {
      block: testBlocks[0].block,
      justifications: testBlocks[0].justifications
    };
    const c = base.toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.block.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert a block', () => {
    const b = testBlocks[0].block;
    const c = base.toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert an extrinsic', () => {
    const xt = testBlocks[0].block.extrinsics[0];
    const c = base.toNamedPrimitive(xt) as any;

    expect(c).toBeDefined();
    expect(c.hash)
      .toBe('0x9e754973630b425e486445ed1600409c97d63a7c2a0679d949d008d784acc917');
  });

  it('should convert all the test blocks', () => {
    for (let i = 0; i < testBlocks.length; i++) {
      const b = base.toNamedPrimitive(testBlocks[i]) as any;
      expect(b.block.hash).toBeDefined();
    }
  });

  it('should convert an array of events', () => {
    const b = testBlocks[0];
    const c = base.toNamedPrimitives(b.events)[0] as any;
    const { section, method, data: {
      dispatchInfo: { weight, paysFee }
    }} = c.event;

    expect(section).toBe('system');
    expect(method).toBe('ExtrinsicSuccess');
    expect(paysFee).toBe('Yes');
    expect(weight.refTime).toBe(229721000);
  });

  it('should convert an array of events passing a single value', () => {
    const b = testBlocks[0];
    const c = base.toNamedPrimitives(b.events[0])[0];

    expect(c).toBeDefined();
    expect(c.event).toBeDefined();
  });

  it('should convert batch calls', () => {
    const batchCall = testBlocks[1].extrinsics[2];
    const xt = base.toNamedPrimitive(batchCall) as any;
    const { call: {
      method, section, args
    }} = xt.extrinsic;

    expect(method).toBe('batchAll');
    expect(section).toBe('utility');
    expect(args.calls.length).toBe(6);

    expect(args.calls[0].value).toBe(14200000000);
    expect(args.calls[0].dest).toStrictEqual({
      'id': '12DuPUY19gJkitzYg4LR1Rijj5hKp7xmM96CYr7QmozmYdBk'
    });
  });

  it('should throw error for types without converters', () => {
    expect(() => {
      const _ = base.toNamedPrimitive({
        yes: true,
        some: 1
      });
    }).toThrowError();
  });

  it('should convert big numbers to strings', () => {
    const b = testBlocksFrom('pk14435209.cbor.bin')[0];
    const c = base.toNamedPrimitive(b) as any;

    expect(typeof c.extrinsics[2].extrinsic.call.args.value).toBe('string');
  });

  it('should convert codec objects', () => {
    const b = testBlocks[0];
    const v = b.block.header;
    const c = base.toNamedPrimitive(v) as any;

    expect(c.number).toBe(15950017);
  });

  it('should convert codec values', () => {
    const b = testBlocks[0];
    const v = b.block.header.number;
    const c = base.toNamedPrimitive(v) as any;

    expect(c.value).toBe(15950017);
  });
});