import { testBlocks, testBlocksFrom } from '@soda/ocelloids-test';

import { toNamedPrimitive, toNamedPrimitives } from './substrate-converters.js';

describe('substrate converters', () => {
  it('should convert an extended signed block', () => {
    const b = testBlocks[0];
    const c = toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.block.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert a block with justifications', () => {
    const b = {
      block: testBlocks[0].block,
      justifications: testBlocks[0].justifications
    };
    const c = toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.block.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert a block', () => {
    const b = testBlocks[0].block;
    const c = toNamedPrimitive(b) as any;

    expect(c).toBeDefined();
    expect(c.header.extrinsicsRoot)
      .toBe('0x382951a7547ec688051e1d95c0589eb8bd247bd4451cf66af35cdfee0f674692');
  });

  it('should convert all the test blocks', () => {
    for (let i = 0; i < testBlocks.length; i++) {
      const b = toNamedPrimitive(testBlocks[i]) as any;
      expect(b.block.hash).toBeDefined();
    }
  });

  it('should convert an array of events', () => {
    const b = testBlocks[0];
    const c = toNamedPrimitives(b.events)[0] as any;
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
    const c = toNamedPrimitives(b.events[0])[0];

    expect(c).toBeDefined();
    expect(c.event).toBeDefined();
  });

  it('should convert batch calls', () => {
    const batchCall = testBlocks[1].extrinsics[2];
    const xt = toNamedPrimitive(batchCall) as any;
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
      const _ = toNamedPrimitive({
        yes: true,
        some: 1
      });
    }).toThrowError();
  });

  it('should convert big numbers to strings', () => {
    const b = testBlocksFrom('pk14435209.cbor.bin')[0];
    const c = toNamedPrimitive(b) as any;

    expect(typeof c.extrinsics[2].extrinsic.call.args.value).toBe('string');
  });
});