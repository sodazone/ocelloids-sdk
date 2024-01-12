import { MultiAddress, DispatchError } from '@polkadot/types/interfaces';
import type { Call } from '@polkadot/types/interfaces/runtime';
import type { Result, Null } from '@polkadot/types-codec';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithIdAndEvent, getArgValueFromTx } from './util.js';

export function extractProxyCalls(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;
  const real = getArgValueFromTx(extrinsic, 'real') as MultiAddress;
  const call = getArgValueFromTx(extrinsic, 'call') as Call;

  const proxyExecutedIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'proxyexecuted'
  );
  const executedEvent = events[proxyExecutedIndex];
  const [callResult] = executedEvent.data as unknown as [Result<Null, DispatchError>];

  if (callResult.isErr) {
    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events.slice(0, proxyExecutedIndex),
        callError: callResult.asErr,
        origin: { type: 'proxy', address: real }
      }
    );
  } else {
    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events.slice(0, proxyExecutedIndex),
        origin: { type: 'proxy', address: real }
      }
    );
  }
}