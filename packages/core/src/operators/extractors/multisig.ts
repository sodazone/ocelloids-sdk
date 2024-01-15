import type { Call, Address } from '@polkadot/types/interfaces/runtime';
import type { Result, Null } from '@polkadot/types-codec';
import type { Vec } from '@polkadot/types-codec';
import { AccountId32, DispatchError } from '@polkadot/types/interfaces';
import { createKeyMulti } from '@polkadot/util-crypto';
import { isU8a, u8aToHex } from '@polkadot/util';

import { TxWithIdAndEvent } from '../../types/interfaces.js';
import { callAsTxWithIdAndEvent, getArgValueFromEvent, getArgValueFromTx } from './util.js';

// Extract executed multisig call
// as_multi emits event MultisigExecuted when threshold is met,
// otherwise emits NewMultisig on new multisig call or MultisigApproval on approval of multisig call without meeting threshold
// approve_as_multi only approves and does not execute even if threshold is met, emits MultisigApproval
export function extractAsMultiCall(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;

  const multisigExecutedIndex = events.findLastIndex(
    e => e.method.toLowerCase() === 'multisigexecuted'
  );

  if (multisigExecutedIndex === -1) {
    return undefined;
  }

  const executedEvent = events[multisigExecutedIndex];
  const callResult = getArgValueFromEvent(executedEvent, 'result') as Result<Null, DispatchError>;
  const multisig = getArgValueFromEvent(executedEvent, 'multisig') as AccountId32;
  const multisigAddress = extrinsic.registry.createTypeUnsafe('Address', [multisig.toHex()]) as Address;

  const call = getArgValueFromTx(tx.extrinsic, 'call') as Call;

  if (callResult.isErr) {
    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events.slice(0, multisigExecutedIndex),
        callError: callResult.asErr,
        origin: {
          type: 'multisig',
          address: multisigAddress
        }
      }
    );
  } else {
    return callAsTxWithIdAndEvent(
      call,
      {
        tx,
        events: events.slice(0, multisigExecutedIndex),
        origin: {
          type: 'multisig',
          address: multisigAddress
        }
      }
    );
  }
}

// as_multi_threshold_1 directly executes the multisig call without emitting event MultisigExecuted
export function extractAsMutiThreshold1Call(tx: TxWithIdAndEvent) {
  const { extrinsic, events } = tx;
  const otherSignatories = getArgValueFromTx(tx.extrinsic, 'other_signatories') as Vec<AccountId32>;
  // Signer must be added to the signatories to obtain the multisig address
  const signatories = otherSignatories.map(s => s.toString());
  signatories.push(extrinsic.signer.toString());
  const multisig = createKeyMulti(signatories, 1);
  const multisigAddress = extrinsic.registry.createTypeUnsafe(
    'Address',
    [isU8a(multisig) ? u8aToHex(multisig) : multisig]
  ) as Address;

  const call = getArgValueFromTx(tx.extrinsic, 'call') as Call;

  return callAsTxWithIdAndEvent(
    call,
    {
      tx,
      events,
      origin: {
        type: 'multisig',
        address: multisigAddress
      }
    }
  );
}
