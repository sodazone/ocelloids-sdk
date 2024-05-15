// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { logger } from '@polkadot/util'

import type { DispatchError, DispatchInfo } from '@polkadot/types/interfaces'

import { GenericExtrinsicWithId } from '../../types/index.js'
import { EventWithId, TxWithIdAndEvent } from '../../types/interfaces.js'
import { findParser } from './index.js'
import { isEventType } from './util.js'

const l = logger('oc-ops-flatten')

const MAX_EVENTS = 200

/**
 * Enum representing static, well-known boundaries.
 */
export enum Boundaries {
  ALL,
}

/**
 * Type defining a boundary for events demarcation to correlate with a call.
 */
export type Boundary =
  | {
      /**
       * The event name, i.e. `section.method`.
       */
      eventName: string
      /**
       * Offset to exclude the current event from the boundary.
       * Defaults to 0.
       */
      offset?: number
    }
  | Boundaries

/**
 * Checks if a boundary is of type `Boundaries.ALL`.
 */
const isAllBoundary = (boundary: Boundary): boundary is Boundaries => {
  return boundary === Boundaries.ALL
}

/**
 * Flattens nested calls in the extrinsic and correlates the events belonging to each call.
 * Supports all the extractors registered in the {@link parsers} map.
 */
export class Flattener {
  private events: {
    event: EventWithId
    callId: number
  }[]
  private calls: TxWithIdAndEvent[]
  private pointer: number
  private tx: TxWithIdAndEvent

  constructor(tx: TxWithIdAndEvent) {
    const { extrinsic } = tx
    const { registry } = extrinsic

    if (tx.events.length > MAX_EVENTS) {
      l.warn(`Number of events (${tx.events.length}) in tx exceeds max limit of ${MAX_EVENTS}. Skipping flatten...`)
      throw new Error(`Number of events (${tx.events.length}) in tx exceeds max limit of ${MAX_EVENTS}`)
    }

    // work on a copy of the events and extrinsics
    this.events = tx.events
      .slice()
      .reverse()
      .map((e) => ({
        event: e,
        callId: 0,
      }))
    this.tx = {
      events: this.events.map(({ event }) => event),
      dispatchError: tx.dispatchError
        ? (registry.createType('DispatchError', tx.dispatchError) as DispatchError)
        : undefined,
      dispatchInfo: tx.dispatchInfo
        ? (registry.createType('DispatchInfo', tx.dispatchInfo) as DispatchInfo)
        : undefined,
      extrinsic: new GenericExtrinsicWithId(extrinsic, extrinsic),
    }

    this.calls = []
    this.pointer = 0
  }

  /**
   * Flattens nested calls in the extrinsic and correlates the events belonging to each call.
   *
   * @param boundary - (Optional) The event boundary.
   * @param id - The level identifier for the current call; e.g. '0.0.1'. Defaults to '0'.
   */
  flatten(boundary?: Boundary, id = '0') {
    l.debug('flatten(boundary, extrinsic)', boundary, this.tx.extrinsic.method.toHuman())

    this.tx.levelId = id
    this.calls.push(this.tx)
    this.correlate(boundary)

    const parser = findParser(this.tx)

    if (parser) {
      const nestedCalls = parser(this.tx, this)
      for (let i = nestedCalls.length - 1; i >= 0; i--) {
        this.tx = nestedCalls[i].call
        this.flatten(nestedCalls[i].boundary, `${id}.${i}`)
      }
    }
  }

  /**
   * Get the flattened calls with associated events.
   */
  get flattenedCalls() {
    const flattenedCalls = this.calls.map((call, i) => {
      const eventsForCall = this.events.filter((e) => e.callId === i)
      call.events = eventsForCall.map((e) => e.event).reverse()
      return call
    })
    return flattenedCalls
  }

  /**
   * Finds the index of the event with the specified name.
   *
   * @param names - The event name or an array of names.
   * @param from - (Optional) The starting index for the search.
   * @returns The index of the found event, or -1 if not found.
   */
  findEventIndex(names: string | string[], from?: number) {
    for (let i = from ?? this.pointer; i < this.events.length; i++) {
      if (isEventType(names, this.events[i].event)) {
        return i
      }
    }
    return -1
  }

  getEvent(index: number) {
    if (index < 0 || index > this.events.length) {
      throw new Error(`Index ${index} not found in ${this}`)
    }
    return this.events[index].event
  }

  get nextPointer() {
    return this.pointer + 1
  }

  toString(): string {
    return JSON.stringify(
      {
        extrinsicId: this.tx.extrinsic.extrinsicId,
        tx: this.tx.extrinsic.method.toHuman(),
        pointer: this.pointer,
        calls: this.calls.map((c) => ({
          levelId: c.levelId,
          method: c.extrinsic.method.toHuman(),
        })),
        events: this.events.map((e) => e.callId + '::' + e.event.method),
      },
      null,
      2
    )
  }

  private correlate(boundary?: Boundary) {
    l.debug('correlate(boundary)', boundary)

    if (boundary === undefined) {
      l.debug('> no boundary')
      return
    }

    if (isAllBoundary(boundary)) {
      const callId = this.calls.length - 1

      l.debug('> ALL(callId, pointer)', callId, this.pointer)

      for (let i = this.pointer; i < this.events.length; i++) {
        this.events[i].callId = callId
      }
    } else {
      const { eventName, offset } = boundary
      // the offset controls the exclusion from the current correlation set
      const eventIndex = this.events
        .slice(this.pointer + (offset ?? 0))
        .findIndex((e) => isEventType(eventName, e.event))
      const callId = this.calls.length - 1

      l.debug('> (callId, pointer, eventName, eventIndex)', callId, this.pointer, eventName, eventIndex)

      this.pointer += eventIndex + 1
      this.pointer = Math.min(this.events.length, this.pointer)

      l.debug('> new pointer', this.pointer)

      for (let i = this.pointer; i < this.events.length; i++) {
        this.events[i].callId = callId
      }

      l.debug(
        '> correlation([callId::event])',
        this.events.map((e) => e.callId + '::' + e.event.method)
      )
    }
  }
}
