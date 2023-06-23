import { EventRecord, Event, Extrinsic, SignedBlock, Block, FunctionMetadataLatest } from '@polkadot/types/interfaces';
import type { AnyJson, CallBase, AnyTuple, Codec } from '@polkadot/types-codec/types';
import type { TxWithEvent, SignedBlockExtended } from '@polkadot/api-derive/types';
import { AbiParam, DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

import { ContractEventWithBlockEvent, ContractMessageWithTx, ExtrinsicWithId } from '../types/index.js';

/**
 * Type guards for identifying specific objects.
 */
function isTxWithEvent(object: any): object is TxWithEvent {
  return object.extrinsic !== undefined && object.events !== undefined;
}

function isExtrinsic(object: any): object is Extrinsic {
  return object.signature !== undefined
    && object.method !== undefined
    && object.era !== undefined;
}

function isExtrinsicWithId(object: any): object is ExtrinsicWithId {
  return object.extrinsic !== undefined
    && object.extrinsic.extrinsicId !== undefined
    &&  isExtrinsic(object);
}

function isEventRecord(object: any): object is EventRecord {
  return object.event !== undefined && object.topics !== undefined;
}

function isEvent(object: any): object is Event {
  return object.data !== undefined && object.index !== undefined && object.meta !== undefined;
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

function isContractMessage(object: any): object is DecodedMessage {
  return object.args !== undefined && object.message !== undefined;
}

function isContractMessageWithTx(object: any): object is ContractMessageWithTx {
  return isExtrinsicWithId(object) && isContractMessage(object);
}

function isContractEvent(object: any): object is DecodedEvent {
  return object.args !== undefined && object.event !== undefined;
}

function isContractEventWithBlockEvent(object: any): object is ContractEventWithBlockEvent {
  return object.blockEvent !== undefined && isContractEvent(object);
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
 * Converts the arguments of a `Call` object to its Uint8Array representation with named fields.
 */
export function callBaseToU8a({ argsDef, args }: CallBase<AnyTuple, FunctionMetadataLatest>) {
  const json: Record<string, Uint8Array> = {};
  const keys = Object.keys(argsDef);

  for (let i = 0; i < keys.length; i++) {
    json[keys[i]] = args[i].toU8a();
  }

  return json;
}

/**
 * Maps the `Event` data names to its corresponding Uint8Array representations.
 * We pass the parameter `isBare=true` to get the Uint8Array without type-specific prefixes.
 */
export function eventNamesToU8aBare({ data }: Event) {
  if (data.names === null) {
    return data.toU8a(true);
  }

  const json: Record<string, Uint8Array> = {};

  for (let i = 0; i < data.names.length; i++) {
    json[data.names[i]] = data[i].toU8a(true);
  }

  return json;
}

/**
 * Converts an `Extrinsic` object to a primitive representation with named fields.
 */
function extrinsicToNamedPrimitive(
  {
    hash,
    signature,
    isSigned,
    isEmpty,
    signer,
    method,
    era,
    nonce,
    tip
  }: Extrinsic
) : Record<string, AnyJson> {
  return {
    hash: hash.toPrimitive(),
    era: era.toHuman(),
    nonce: nonce.toPrimitive(),
    tip: tip.toPrimitive(),
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

function contractParamsToNamedPrimitive(abiParams: AbiParam[], args: Codec[]) {
  const params: Record<string, AnyJson> = {};
  abiParams.forEach((param, i) => {
    params[param.name] = args[i].toPrimitive();
  });
  return params;
}

function contractMessageToNamedPrimitive(data: DecodedMessage) {
  // Pick only the properties in AbiMessage that satisfy Record<string, AnyJson> type
  // We are leaving out:
  // returnType: TypeDef -> has type Enum that does not comply with AnyJson
  // args: AbiParam[] -> contains TypeDef, see above
  // fromU8a: Function
  // toU8a: Function
  // selector: to be transformed to primitive type
  const picked = (
    ({ isDefault, isMutating, isPayable, docs, identifier, index, method, path }) =>
      ({ isDefault, isMutating, isPayable, docs, identifier, index, method, path })
  )(data.message);

  return {
    args: contractParamsToNamedPrimitive(data.message.args, data.args),
    message: {
      ...picked,
      selector: data.message.selector.toPrimitive()
    }
  };
}

function contractMessageWithTxToNamedPrimitive(data: ContractMessageWithTx) {
  return {
    ...txWithEventToNamedPrimitive(data),
    ...contractMessageToNamedPrimitive(data)
  };
}

function contractEventToNamedPrimitive(data: DecodedEvent) {
  // Pick only the properties in AbiEvent that satisfy Record<string, AnyJson> type
  // We are leaving out:
  // args: AbiParam[] -> contains type Enum that does not comply with AnyJson
  // fromU8a: Function
  const picked = (
    ({ docs, identifier, index }) =>
      ({ docs, identifier, index })
  )(data.event);

  return {
    event: picked,
    args: contractParamsToNamedPrimitive(data.event.args, data.args),
  };
}

function contractEventWithBlockEventToNamePrimitive(data: ContractEventWithBlockEvent) {
  return {
    blockEvent: eventToNamedPrimitive(data.blockEvent),
    ...contractEventToNamedPrimitive(data)
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
// We are leveraging on guards for type inference.
// eslint-disable-next-line complexity
export function toNamedPrimitive<T>(data: T): Record<string, AnyJson> {
  switch (true) {
  case isEventRecord(data):
    return eventRecordToNamedPrimitive(data as EventRecord);
  case isContractMessageWithTx(data):
    return contractMessageWithTxToNamedPrimitive(data as ContractMessageWithTx);
  case isContractMessage(data):
    return contractMessageToNamedPrimitive(data as DecodedMessage);
  case isContractEventWithBlockEvent(data):
    return contractEventWithBlockEventToNamePrimitive(data as ContractEventWithBlockEvent);
  case isEvent(data):
    return eventToNamedPrimitive(data as Event);
  case isTxWithEvent(data):
    return txWithEventToNamedPrimitive(data as TxWithEvent);
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

