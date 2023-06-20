import { EventRecord, Event, Extrinsic, SignedBlock, Block, FunctionMetadataLatest } from '@polkadot/types/interfaces';
import { AnyJson, CallBase, AnyTuple } from '@polkadot/types-codec/types';
import { TxWithEvent, SignedBlockExtended } from '@polkadot/api-derive/types';

/**
 * Type guards for identifying specific objects.
 */
function isTxWithEvent(object: any): object is TxWithEvent {
  return object.extrinsic !== undefined && object.events !== undefined;
}

function isEventRecord(object: any): object is EventRecord {
  return object.event !== undefined && object.topics !== undefined;
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
function eventToNamedPrimitive(event: Event) {
  return {
    section: event.section,
    method: event.method,
    data: eventNamesToPrimitive(event)
  };
}

/**
 * Converts an `EventRecord` object to a primitive representation with named fields.
 */
function eventRecordToNamedPrimitive(
  { event, phase, topics }: EventRecord
) {
  return {
    phase: phase.toPrimitive(),
    topics: topics.toPrimitive(),
    event: eventToNamedPrimitive(event)
  };
}

/**
 * Converts the arguments of a `Call` object to a primitive representation with named fields.
 */
export function callBaseToPrimitive({ argsDef, args, registry }: CallBase<AnyTuple, FunctionMetadataLatest>) {
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
    } else {
      json[argName] = args[i].toPrimitive();
    }
  }

  return json;
}

/**
 * Converts an `Extrinsic` object to a primitive representation with named fields.
 */
function extrinsicToNamedPrimitive(
  { hash, signature, isSigned, isEmpty, signer, method }: Extrinsic
) : Record<string, AnyJson> {
  return {
    hash: hash.toPrimitive(),
    signature: signature.toPrimitive(),
    signer: signer.toPrimitive(),
    isSigned,
    isEmpty,
    call: {
      method: method.method,
      section: method.section,
      args: callBaseToPrimitive(method),
    }
  };
}

/**
 * Converts a `TxWithEvent` object to a primitive representation with named fields.
 */
function txWithEventToNamedPrimitive(data: TxWithEvent) {
  return {
    extrinsic: extrinsicToNamedPrimitive(data.extrinsic as Extrinsic),
    events: data.events.map(eventToNamedPrimitive)
  };
}

/**
 * Converts a `Block` object to a primitive representation with named fields.
 */
function blockToNamedPrimitive({hash, contentHash, header, extrinsics}: Block) {
  return {
    hash: hash.toHex(),
    contentHash: contentHash.toHex(),
    header: header.toPrimitive(),
    extrinsics: extrinsics.map(extrinsicToNamedPrimitive)
  };
}

/**
 * Converts a `SignedBlock` object to a primitive representation with named fields.
 */
function signedBlockToNamedPrimitive(data: SignedBlock) {
  return {
    block: blockToNamedPrimitive(data.block),
    justifications: data.justifications?.toPrimitive()
  };
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
export function toNamedPrimitive<T>(data: T): Record<string, AnyJson> {
  switch (true) {
  case isEventRecord(data):
    return eventRecordToNamedPrimitive(data as EventRecord);
  case isTxWithEvent(data):
    return txWithEventToNamedPrimitive(data as TxWithEvent);
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
  default:
    throw new Error(`No converter found for ${data}`);
  }
}

/**
 * Converts an object or an array of objects to a primitive representation with named fields based on their types.
 *
 * @param data - The object or array of objects to convert.
 * @returns An array of objects in a primitive representation with named fields.
 * @see toNamedPrimitive
 */
export function toNamedPrimitives<T>(data: T): Record<string, AnyJson>[] {
  return Array.isArray(data) ? data.map(toNamedPrimitive) : [toNamedPrimitive(data)];
}

