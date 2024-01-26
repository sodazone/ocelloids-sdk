// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0
import type { AnyJson } from '@polkadot/types-codec/types';

import { testBlocks, testBlocksFrom } from '@sodazone/ocelloids-test';

import { base } from './base.js';
import { GenericEventWithId } from '../types/event.js';
import { EventWithIdAndTx } from '../types/interfaces.js';
import { enhanceTxWithId } from '../types/extrinsic.js';

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

  it('should convert events with ID', () => {
    const b = testBlocks[0];
    const e = b.events[0];
    const { number, hash } = b.block.header;
    const eventWithId = new GenericEventWithId(e.event, {
      blockNumber: number,
      blockHash: hash,
      extrinsicPosition: 0,
      extrinsicId: `${number.toNumber()}-0`
    });

    const c = base.toNamedPrimitives(eventWithId)[0];
    expect(c).toBeDefined();
    expect(c.method).toBeDefined();
    expect(c.data).toBeDefined();
    expect(c.eventId).toBeDefined();
    expect(c.eventId).toBe(`${number.toNumber()}-0-0`);
  });

  it('should convert events with ID and Tx', () => {
    const b = testBlocks[0];
    const e = b.events[0];
    const { number, hash } = b.block.header;
    const txWithId = enhanceTxWithId(
      {
        blockNumber: number,
        blockHash: hash,
        blockPosition: 0
      },
      b.extrinsics[0]
    );
    const eventWithIdAndTx = new GenericEventWithId(e.event, {
      blockNumber: number,
      blockHash: hash,
      extrinsicPosition: 0,
      extrinsicId: txWithId.extrinsic.extrinsicId
    }) as EventWithIdAndTx;
    eventWithIdAndTx.extrinsic = txWithId.extrinsic;

    const c = base.toNamedPrimitives(eventWithIdAndTx)[0];
    expect(c).toBeDefined();
    expect(c.method).toBeDefined();
    expect(c.data).toBeDefined();
    expect(c.eventId).toBeDefined();
    expect(c.eventId).toBe(`${number.toNumber()}-0-0`);
    expect(c.extrinsic).toBeDefined();
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

  it('should allow basic objects', () => {
    expect(base.toNamedPrimitive({
      hello: 'world'
    })).toStrictEqual({hello: 'world'});
  });

  it('should convert humanizable objects', () => {
    expect(base.toNamedPrimitive({
      hello: 'world',
      toHuman: () => {
        return {
          hola: true
        } as AnyJson;
      }
    })).toStrictEqual({ hola: true });
  });

  it('should throw error for types without converters', () => {
    expect(() => {
      const _ = base.toNamedPrimitive(null);
    }).toThrow();
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