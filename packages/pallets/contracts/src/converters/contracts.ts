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

import type { AnyJson, Codec } from '@polkadot/types-codec/types';
import { AbiParam, DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

import { converters } from '@sodazone/ocelloids';

import { ContractEventWithBlockEvent, ContractMessageWithTx } from '../types/interfaces.js';

function isContractMessage(object: any): object is DecodedMessage {
  return object.args !== undefined && object.message !== undefined;
}

function isContractMessageWithTx(object: any): object is ContractMessageWithTx {
  return converters.guards.isTxWithEvent(object) && isContractMessage(object);
}

function isContractEvent(object: any): object is DecodedEvent {
  return object.args !== undefined && object.event !== undefined;
}

function isContractEventWithBlockEvent(object: any): object is ContractEventWithBlockEvent {
  return object.blockEvent !== undefined && isContractEvent(object);
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
    ...contractMessageToNamedPrimitive(data),
    ...converters.helpers.txWithEventToNamedPrimitive(data)
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

function contractEventWithBlockEventToNamedPrimitive(data: ContractEventWithBlockEvent) {
  return {
    blockEvent: converters.helpers.eventToNamedPrimitive(data.blockEvent),
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
function toNamedPrimitive<T>(data: T): Record<string, AnyJson> {
  switch (true) {
  case isContractMessageWithTx(data):
    return contractMessageWithTxToNamedPrimitive(data as ContractMessageWithTx);
  case isContractMessage(data):
    return contractMessageToNamedPrimitive(data as DecodedMessage);
  case isContractEventWithBlockEvent(data):
    return contractEventWithBlockEventToNamedPrimitive(data as ContractEventWithBlockEvent);
  default:
    throw new Error(`No converter found for ${JSON.stringify(data)}`);
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

export const contracts : converters.Converter = {
  toNamedPrimitive,
  toNamedPrimitives
};

