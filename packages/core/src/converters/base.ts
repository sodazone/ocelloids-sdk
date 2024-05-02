// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import {
  EventRecord,
  Event,
  Extrinsic,
  SignedBlock,
  Block,
  FunctionMetadataLatest,
  Address,
  MultiAddress,
  AccountId,
} from '@polkadot/types/interfaces';
import type { Codec } from '@polkadot/types/types';
import type { AnyJson, CallBase, AnyTuple } from '@polkadot/types-codec/types';
import type { TxWithEvent, SignedBlockExtended } from '@polkadot/api-derive/types';
import { EventWithId, EventWithIdAndTx, ExtrinsicWithId, TxWithIdAndEvent } from '../types/interfaces.js';

/* ================================================================
   Type guards for identifying specific objects.
   ================================================================ */

function isExtrinsic(object: any): object is Extrinsic {
  return object.signature !== undefined && object.method !== undefined && object.era !== undefined;
}

function isExtrinsicWithId(object: any): object is ExtrinsicWithId {
  return object.extrinsicId !== undefined && isExtrinsic(object);
}

function isTxWithEvent(object: any): object is TxWithEvent {
  // Note that the rest of fields could be undefined
  // so.. order carefully your guard checks
  return object.extrinsic !== undefined && object.events !== undefined && isExtrinsic(object.extrinsic);
}

function isTxWithIdAndEvent(object: any): object is TxWithIdAndEvent {
  return object.extrinsic !== undefined && object.extrinsic.extrinsicId !== undefined && isTxWithEvent(object);
}

function isEventRecord(object: any): object is EventRecord {
  return object.event !== undefined && object.topics !== undefined;
}

function isEvent(object: any): object is Event {
  return object.data !== undefined && object.index !== undefined && object.meta !== undefined;
}

function isEventWithId(object: any): object is EventWithId {
  return object.eventId !== undefined && isEvent(object);
}

function isEventWithIdAndTx(object: any): object is EventWithIdAndTx {
  return object.extrinsic !== undefined && isEventWithId(object);
}

function isSignedBlockExtended(object: any): object is SignedBlockExtended {
  return object.events !== undefined && object.extrinsics !== undefined;
}

function isSignedBlock(object: any): object is SignedBlock {
  return object.block !== undefined && object.justifications !== undefined;
}

function isBlock(object: any): object is Block {
  return object.header !== undefined && object.extrinsics !== undefined;
}

function isRecord(obj: AnyJson): obj is Record<string, AnyJson> {
  return obj !== null && typeof obj === 'object' && Object.getOwnPropertySymbols(obj).length === 0;
}

function isCodec(object: any): object is Codec {
  return object.registry !== undefined && object.hash !== undefined;
}

interface Humanizable {
  toHuman(isExtended?: boolean): AnyJson;
}

function isHumanizable(object: any): object is Humanizable {
  return object.toHuman !== undefined;
}

function expandAddress(address: AccountId | Address | MultiAddress) {
  const accountId: AccountId = (address as any).value ?? address;
  return {
    id: accountId.toPrimitive(),
    publicKey: accountId.toHex(),
  };
}

/**
 * Maps the `Event` data names to its corresponding values.
 */
function eventNamesToPrimitive({ data }: Event) {
  if (data.names === null) {
    return data.toPrimitive();
  }

  const json: Record<string, AnyJson> = {};

  for (let i = 0; i < data.names.length; i++) {
    json[data.names[i]] = data[i].toPrimitive();
  }

  return json;
}

/**
 * Converts an `Event` object to a primitive representation with named fields.
 */
export function eventToNamedPrimitive(event: Event) {
  return {
    section: event.section,
    method: event.method,
    data: eventNamesToPrimitive(event),
  };
}

/**
 * Converts an `EventRecord` object to a primitive representation with named fields.
 */
function eventRecordToNamedPrimitive({ event, phase, topics }: EventRecord) {
  return {
    phase: phase.toPrimitive(),
    topics: topics.toPrimitive(),
    event: eventToNamedPrimitive(event),
  };
}

/**
 * Converts the arguments of a `Call` object to a primitive representation with named fields.
 */
function callBaseToPrimitive({ argsDef, args, registry }: CallBase<AnyTuple, FunctionMetadataLatest>) {
  const json: Record<string, AnyJson> = {};
  const keys = Object.keys(argsDef);

  for (let i = 0; i < keys.length; i++) {
    const argName = keys[i];
    const lookupName = argsDef[argName];
    const { type } = registry.lookup.getTypeDef(lookupName as any);

    // Handle nested calls, e.g. Batch
    if (type === 'Vec<Call>') {
      const calls = args[i] as unknown as CallBase<AnyTuple, FunctionMetadataLatest>[];
      json[argName] = calls.map(callBaseToPrimitive);
    } else if (type === 'MultiAddress') {
      json[argName] = expandAddress(args[i] as MultiAddress);
    } else if (type === 'Address') {
      json[argName] = expandAddress(args[i] as Address);
    } else if (type === 'AccountId') {
      json[argName] = expandAddress(args[i] as AccountId);
    } else {
      json[argName] = args[i].toPrimitive();
    }
  }

  return json;
}

/**
 * Converts an `Extrinsic` object to a primitive representation with named fields.
 */
function extrinsicToNamedPrimitive({
  hash,
  signature,
  isSigned,
  isEmpty,
  signer,
  method,
  era,
  nonce,
  tip,
}: Extrinsic): Record<string, AnyJson> {
  return {
    hash: hash.toPrimitive(),
    era: era.toHuman(),
    nonce: nonce.toPrimitive(),
    tip: tip.toPrimitive(),
    signature: signature.toPrimitive(),
    signer: expandAddress(signer),
    isSigned,
    isEmpty,
    call: {
      method: method.method,
      section: method.section,
      args: callBaseToPrimitive(method),
    },
  };
}

/**
 * Converts an `EventWithId` object to a primitive representation with named fields.
 */
export function eventWithIdToNamedPrimitive(event: EventWithId) {
  const { blockNumber, blockHash, blockPosition, eventId } = event;
  return {
    ...eventToNamedPrimitive(event),
    blockNumber: blockNumber.toPrimitive(),
    blockHash: blockHash.toPrimitive(),
    blockPosition,
    eventId,
  };
}

/**
 * Converts an `EventWithIdAndTx` object to a primitive representation with named fields.
 */
export function eventWithIdAndTxToNamedPrimitive(event: EventWithIdAndTx) {
  const { extrinsicId, extrinsicPosition, extrinsic } = event;
  return {
    ...eventWithIdToNamedPrimitive(event),
    extrinsicId,
    extrinsicPosition,
    extrinsic: extrinsicToNamedPrimitive(extrinsic),
  };
}

/**
 * Converts a `ExtrinsicWithId` object to a primitive representation with named fields.
 */
export function extrinsicWithIdToNamedPrimitive(data: ExtrinsicWithId) {
  const { extrinsicId, blockHash, blockNumber, blockPosition, extraSigners } = data;
  return {
    ...extrinsicToNamedPrimitive(data as Extrinsic),
    blockNumber: blockNumber.toPrimitive(),
    blockHash: blockHash.toPrimitive(),
    blockPosition,
    extrinsicId,
    extraSigners: extraSigners.map((o) => ({
      type: o.type,
      address: expandAddress(o.address),
    })),
  };
}

/**
 * Converts a `TxWithEvent` object to a primitive representation with named fields.
 */
export function txWithEventToNamedPrimitive(data: TxWithEvent) {
  return {
    extrinsic: extrinsicToNamedPrimitive(data.extrinsic as Extrinsic),
    events: data.events?.map(eventToNamedPrimitive) || [],
    dispatchInfo: data.dispatchInfo?.toHuman(),
    dispatchError: data.dispatchError?.toHuman(),
  };
}

/**
 * Converts a `TxWithIdAndEvent` object to a primitive representation with named fields.
 */
export function txWithIdAndEventToNamedPrimitive(data: TxWithIdAndEvent) {
  return {
    extrinsic: extrinsicWithIdToNamedPrimitive(data.extrinsic as ExtrinsicWithId),
    events: data.events?.map(eventWithIdToNamedPrimitive) || [],
    dispatchInfo: data.dispatchInfo?.toHuman(),
    dispatchError: data.dispatchError?.toHuman(),
    levelId: data.levelId,
  };
}

/**
 * Converts a `Block` object to a primitive representation with named fields.
 */
function blockToNamedPrimitive({ hash, contentHash, header, extrinsics }: Block) {
  return {
    hash: hash.toHex(),
    contentHash: contentHash.toHex(),
    header: header.toPrimitive(),
    extrinsics: extrinsics.map(extrinsicToNamedPrimitive),
  };
}

/**
 * Converts a `SignedBlock` object to a primitive representation with named fields.
 */
function signedBlockToNamedPrimitive(data: SignedBlock) {
  return {
    block: blockToNamedPrimitive(data.block),
    justifications: data.justifications?.toPrimitive(),
  };
}

/**
 * Converts a `Codec` object to a primitive representation.
 *
 * Wraps the value in a 'value' key for non-indexable JSON objects.
 */
function codecToNamedPrimitive(data: Codec): Record<string, AnyJson> {
  const converted = data.toPrimitive();
  return isRecord(converted) ? converted : { value: converted };
}

/**
 * Converts an object to a primitive representation with named fields based on its type.
 *
 * The conversion retains both key-value mapping and primitive types,
 * i.e. a mix between the human and primitive representation.
 * This conversion allows easy JSON filtering and matching operations.
 *
 * @param data - The object to convert.
 * @returns The object in a primitive representation with named fields.
 * @throws If no converter is found for the given object.
 */
// We are leveraging on guards for type inference.
// eslint-disable-next-line complexity
function toNamedPrimitive<T>(data: T): Record<string, AnyJson> {
  switch (true) {
    case isEventWithIdAndTx(data):
      return eventWithIdAndTxToNamedPrimitive(data as EventWithIdAndTx);
    case isEventWithId(data):
      return eventWithIdToNamedPrimitive(data as EventWithId);
    case isEventRecord(data):
      return eventRecordToNamedPrimitive(data as EventRecord);
    case isEvent(data):
      return eventToNamedPrimitive(data as Event);
    case isTxWithIdAndEvent(data):
      return txWithIdAndEventToNamedPrimitive(data as TxWithIdAndEvent);
    case isTxWithEvent(data):
      return txWithEventToNamedPrimitive(data as TxWithEvent);
    case isExtrinsicWithId(data):
      return extrinsicWithIdToNamedPrimitive(data as ExtrinsicWithId);
    case isExtrinsic(data):
      return extrinsicToNamedPrimitive(data as Extrinsic);
    case isSignedBlockExtended(data):
      return {
        author: (data as SignedBlockExtended).author?.toPrimitive(),
        extrinsics: (data as SignedBlockExtended).extrinsics.map(txWithEventToNamedPrimitive),
        events: (data as SignedBlockExtended).events.map(eventRecordToNamedPrimitive),
        ...signedBlockToNamedPrimitive(data as SignedBlock),
      };
    case isSignedBlock(data):
      return signedBlockToNamedPrimitive(data as SignedBlock);
    case isBlock(data):
      return blockToNamedPrimitive(data as Block);
    case isCodec(data):
      return codecToNamedPrimitive(data as Codec);
    case isHumanizable(data):
      return (data as Humanizable).toHuman() as Record<string, AnyJson>;
    default:
      try {
        return data as Record<string, AnyJson>;
      } catch {
        throw new Error(`No converter found for ${JSON.stringify(data)}`);
      }
  }
}

/**
 * Converts an object or an array of objects to a primitive representation with named fields based on their types.
 *
 * @param data - The object or array of objects to convert.
 * @returns An array of objects in a primitive representation with named fields.
 * @see toNamedPrimitive
 */
function toNamedPrimitives<T>(data: T): Record<string, AnyJson>[] {
  return Array.isArray(data) ? data.map(toNamedPrimitive) : [toNamedPrimitive(data)];
}

export interface Converter {
  toNamedPrimitive: <T>(data: T) => Record<string, AnyJson>;
  toNamedPrimitives: <T>(data: T) => Record<string, AnyJson>[];
}

export const base: Converter = {
  toNamedPrimitive,
  toNamedPrimitives,
};

export const guards = {
  isTxWithEvent,
};

export const helpers = {
  txWithEventToNamedPrimitive,
  eventToNamedPrimitive,
};
