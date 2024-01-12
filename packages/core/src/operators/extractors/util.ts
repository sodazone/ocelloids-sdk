import type { FunctionMetadataLatest, Event, DispatchError } from '@polkadot/types/interfaces';
import type { CallBase, AnyTuple } from '@polkadot/types-codec/types';
import { GenericCall, GenericExtrinsic } from '@polkadot/types';

import { GenericExtrinsicWithId, Origin } from '../../types/extrinsic.js';
import { ExtrinsicWithId, TxWithIdAndEvent } from '../../types/interfaces.js';

type CallContext = {
  tx: TxWithIdAndEvent,
  events: Event[],
  callError?: DispatchError,
  origin? : Origin
}

export function callAsTxWithIdAndEvent(
  call: CallBase<AnyTuple, FunctionMetadataLatest>,
  { tx, events, callError, origin }: CallContext
) {
  const { extrinsic } = tx;
  const flatCall = new GenericCall(extrinsic.registry, call);
  const { blockNumber, blockPosition, blockHash } = extrinsic;
  const flatExtrinsic = new GenericExtrinsic(extrinsic.registry, {
    method: flatCall,
    signature: extrinsic.inner.signature
  });
  const txWithId = new GenericExtrinsicWithId(
    flatExtrinsic,
    {
      blockNumber,
      blockHash,
      blockPosition
    },
    extrinsic.origins
  );

  if (origin) {
    txWithId.addOrigin(origin);
  }

  return {
    ...tx,
    events,
    dispatchError: callError ? callError : tx.dispatchError,
    extrinsic: txWithId
  };
}

export function getArgValueFromTx(extrinsic: ExtrinsicWithId, name: string) {
  const { args, argsDef } = extrinsic.method;
  const keys = Object.keys(argsDef);
  const indexOfData = keys.findIndex(k => k === name);
  if (indexOfData !== -1) {
    return args[indexOfData];
  }
  throw new Error(
    `Extrinsic ${extrinsic.method.toHuman()} does not contain argument with name ${name}`
  );
}

export function getArgValueFromEvent(event: Event, name: string) {
  const { names } = event.data;
  if (!names) {
    throw new Error(
      `Event ${event.section}.${event.method} does not have list of data names`
    );
  }
  const indexOfData = names.findIndex(k => k === name);
  if (indexOfData !== -1) {
    return event.data[indexOfData];
  }
  throw new Error(
    `Event ${event.section}.${event.method} does not contain argument with name ${name}`
  );
}