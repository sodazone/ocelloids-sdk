import type { SignedBlockExtended } from '@polkadot/api-derive/types';
import { Abi } from '@polkadot/api-contract';

import { Observable, share } from 'rxjs';

import {
  ControlQuery,
  Criteria,
  mongoFilter,
  filterExtrinsics,
  extractEventsWithTx
} from '@sodazone/ocelloids';

import { contractEvents, contractMessages } from './index.js';
import { ContractEventWithBlockEvent, ContractMessageWithTx } from '../types/interfaces.js';
import { AddressParam } from '../types/types.js';
import { contracts } from '../converters/contracts.js';

/**
 * Filters contract calls based on the provided criteria.
 *
 * @param abi The ABI of the contract as a JSON object or string.
 * @param address The contract address or an array of addresses.
 * @param callsCriteria The criteria to filter contract calls.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An observable that emits filtered contract calls.
 */
export function filterContractCalls(
  abi: Abi,
  address: AddressParam,
  callsCriteria: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {
    dispatchError: { $exists: false }
  }
) {
  const callsQuery = ControlQuery.from(callsCriteria);

  return (source: Observable<SignedBlockExtended>)
      : Observable<ContractMessageWithTx> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria),
      contractMessages(abi, address),
      // tap(x => console.log(x.extrinsic.toHuman(), x.message)),
      // Filters over the decoded message,
      // tx or event
      mongoFilter(callsQuery, contracts),
      // Share multicast
      share()
    );
  };
}

/**
 * Filters contract events based on the provided criteria.
 *
 * @param abi The ABI of the contract as a JSON object or string.
 * @param address The contract address or an array of addresses.
 * @param eventsCriteria The criteria to filter contract events.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An observable that emits filtered contract events.
 */
export function filterContractEvents(
  abi: Abi,
  address: AddressParam,
  eventsCriteria: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {
    dispatchError: { $exists: false }
  }
) {
  const eventsQuery = ControlQuery.from(eventsCriteria);

  return (source: Observable<SignedBlockExtended>)
        : Observable<ContractEventWithBlockEvent> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria),
      extractEventsWithTx(),
      contractEvents(abi, address),
      // Filters over the decoded event
      mongoFilter(eventsQuery, contracts),
      // Share multicast
      share()
    );
  };
}