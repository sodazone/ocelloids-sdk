// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { logger } from '@polkadot/util';

import type { Event } from '@polkadot/types/interfaces';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { extractors } from './index.js';
import { isEventType } from './util.js';

const l = logger('oc-ops-flattener');

// eslint-disable-next-line no-shadow
export enum Boundaries {
  ALL
}
export type Boundary = {
  eventName: string,
  offset?: number
} | Boundaries;

const isAllBoundary = (boundary: Boundary): boundary is Boundaries => {
  return boundary === Boundaries.ALL;
};

export class Flattener {
  tx: TxWithIdAndEvent;
  events: {
    event: Event,
    callId: number
  }[];
  calls: TxWithIdAndEvent[];
  pointer: number;

  constructor(tx: TxWithIdAndEvent) {
    this.tx = tx;
    // do not mutate
    this.events = tx.events.slice().reverse().map(e => ({
      event: e,
      callId: 0
    }));
    this.calls = [];
    this.pointer = 0;
  }

  flatten(boundary?: Boundary, id = '0') {
    l.debug(
      'flatten(boundary, extrinsic)',
      boundary,
      this.tx.extrinsic.method.toHuman()
    );

    this.tx.levelId = id;
    this.calls.push(this.tx);
    this.correlate(boundary);

    const {extrinsic: { method }} = this.tx;
    const methodSignature = `${method.section}.${method.method}`;
    const extractor = extractors[methodSignature];

    if (extractor) {
      const nestedCalls = extractor(this.tx, this);
      for (let i = nestedCalls.length - 1; i >= 0; i--) {
        this.tx = nestedCalls[i].call;
        this.flatten(nestedCalls[i].boundary, `${id}.${i}`);
      }
    }
  }

  get flattenedCalls() {
    const flattenedCalls = this.calls.map((call, i) => {
      const eventsForCall = this.events.filter(e => e.callId === i);
      call.events = eventsForCall.map(e => e.event).reverse();
      return call;
    });
    return flattenedCalls;
  }

  private correlate(boundary?: Boundary) {
    l.debug('correlate(boundary)', boundary);

    if (boundary === undefined) {
      l.debug('> no boundary');
      return;
    }

    if (isAllBoundary(boundary)) {
      const callId = this.calls.length - 1;

      l.debug('> ALL(callId, pointer)', callId, this.pointer);

      for (let i = this.pointer; i < this.events.length; i++) {
        this.events[i].callId = callId;
      }
    } else {
      const { eventName, offset } = boundary;
      // the offset controls the exclusion from the current correlation set
      const eventIndex = this.events.slice(this.pointer + (offset ?? 0))
        .findIndex(e => isEventType(eventName, e.event));
      const callId = this.calls.length - 1;

      l.debug(
        '> (callId, pointer, eventName, eventIndex)',
        callId, this.pointer, eventName, eventIndex
      );

      this.pointer +=  eventIndex + 1;
      this.pointer = Math.min(this.events.length, this.pointer);

      l.debug('> new pointer', this.pointer);

      for (let i = this.pointer; i < this.events.length; i++) {
        this.events[i].callId = callId;
      }

      l.debug(
        '> correlation([callId::event])',
        this.events.map(e => e.callId + '::' + e.event.method)
      );
    }
  }

  findEventIndex(method: string | string[], from?: number) {
    for (let i = from ?? this.pointer; i < this.events.length; i++) {
      if (isEventType(method, this.events[i].event)) {
        return i;
      }
    }
    return -1;
  }

  getEvent(index: number) {
    return this.events[index].event;
  }

  get nextPointer() {
    return this.pointer + 1;
  }
}
