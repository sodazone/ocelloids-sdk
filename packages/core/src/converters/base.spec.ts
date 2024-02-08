// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0
import type { AnyJson } from '@polkadot/types-codec/types';

import { testBlocks, testBlocksFrom } from '@sodazone/ocelloids-test';

import { base } from './base.js';
import { GenericEventWithId, GenericEventWithIdAndTx } from '../types/event.js';
import { EventWithIdAndTx } from '../types/interfaces.js';
import { enhanceTxWithIdAndEvents } from '../types/extrinsic.js';

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

  it('should include the decoded key of the extrinsic signer', () => {
    const xt = testBlocks[0].block.extrinsics[2];
    const c = base.toNamedPrimitive(xt) as any;

    expect(c).toBeDefined();
    expect(c.signer.id).toBe('1sa85enM8EQ56Tzfyg97kvQf1CYfPoTczin4ASYTwUdH9iK');
    expect(c.signer.publicKey).toBe('0x2691c4e0a42c029658db99ea8a362425d7218b72c158758049e4cd5581492826');
    expect(c.hash)
      .toBe('0x5591f75aac034e1d595af2684374eea74bae301279f37f63e065d921bdc3efb0');
  });

  it('should convert an TxWithEvent', () => {
    const xt = testBlocks[0].extrinsics[0];
    const c = base.toNamedPrimitive(xt) as any;

    expect(c).toBeDefined();
    expect(c.extrinsic).toBeDefined();
    expect(c.events).toBeDefined();
  });

  it('should convert an TxWithIdAndEvent', () => {
    const b = testBlocks[0];
    const { number, hash } = b.block.header;
    const txWithIdAndEvent = enhanceTxWithIdAndEvents(
      {
        blockNumber: number,
        blockHash: hash,
        blockPosition: 0
      },
      b.extrinsics[0],
      b.events
    );
    const c = base.toNamedPrimitive(txWithIdAndEvent) as any;

    expect(c).toBeDefined();
    expect(c.extrinsic).toBeDefined();
    expect(c.extrinsic.extrinsicId).toBeDefined();
    expect(c.extrinsic.extraSigners).toStrictEqual([]);
    expect(c.events).toBeDefined();
    expect(c.events[0].eventId).toBeDefined();
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
      blockPosition: 0
    });

    const c = base.toNamedPrimitives(eventWithId)[0];
    expect(c).toBeDefined();
    expect(c.method).toBeDefined();
    expect(c.data).toBeDefined();
    expect(c.eventId).toBeDefined();
    expect(c.eventId).toBe(`${number.toNumber()}-0`);
  });

  it('should convert events with ID and Tx', () => {
    const b = testBlocks[0];
    const e = b.events[0];
    const { number, hash } = b.block.header;
    const txWithId = enhanceTxWithIdAndEvents(
      {
        blockNumber: number,
        blockHash: hash,
        blockPosition: 0
      },
      b.extrinsics[0],
      b.events
    );
    const eventWithIdAndTx = new GenericEventWithIdAndTx(e.event, {
      blockNumber: number,
      blockHash: hash,
      blockPosition: 0,
      extrinsicPosition: 0,
      extrinsicId: txWithId.extrinsic.extrinsicId,
      extrinsic: txWithId.extrinsic
    }) as EventWithIdAndTx;

    const c = base.toNamedPrimitives(eventWithIdAndTx)[0];
    expect(c).toBeDefined();
    expect(c.method).toBeDefined();
    expect(c.data).toBeDefined();
    expect(c.eventId).toBeDefined();
    expect(c.eventId).toBe(`${number.toNumber()}-0`);
    expect(c.extrinsic).toBeDefined();
    expect(c.extrinsicId).toBeDefined();
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
      'id': '12DuPUY19gJkitzYg4LR1Rijj5hKp7xmM96CYr7QmozmYdBk',
      'publicKey': '0x361387c4094a44fa64865664c60216d1a2d3acef0ab04e0b7d5ebd7ffc42b7f2'
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

  it('should include public key for multi address args', () => {
    const b = testBlocksFrom('pk14435209.cbor.bin')[0];
    const c = base.toNamedPrimitive(b) as any;
    const { dest } = c.extrinsics[2].extrinsic.call.args;

    expect(dest.id).toBe('14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6');
    expect(dest.publicKey).toBe('0x94e58ead97ea7dbbc1f671d23a8d52a66e5659da2eddc1d139e0c49d8f648441');
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