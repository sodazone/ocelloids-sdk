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
 * @param callsCriteria - (Optional) The criteria to filter contract calls.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An observable that emits filtered contract calls.
 */
export function filterContractCalls(
  abi: Abi,
  address: AddressParam,
  callsCriteria?: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {
    dispatchError: { $exists: false }
  }
) {
  let callsQuery: ControlQuery | undefined;

  if (callsCriteria) {
    callsQuery = ControlQuery.from(callsCriteria);
  }

  return (source: Observable<SignedBlockExtended>)
      : Observable<ContractMessageWithTx> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria),
      contractMessages(abi, address),
      // If callsCriteria is defined,
      // filters over the decoded message, tx or event.
      // Else, pass through all contract messages.
      callsQuery ?
        mongoFilter(callsQuery, contracts) :
        x => x,
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
 * @param eventsCriteria - (Optional) The criteria to filter contract events.
 * @param extrinsicsCriteria - (Optional) Criteria for filtering extrinsics. Defaults to `{ dispatchError: { $exists: false } }`.
 * @returns An observable that emits filtered contract events.
 */
export function filterContractEvents(
  abi: Abi,
  address: AddressParam,
  eventsCriteria?: ControlQuery | Criteria,
  extrinsicsCriteria : Criteria = {
    dispatchError: { $exists: false }
  }
) {
  let eventsQuery: ControlQuery | undefined;

  if (eventsCriteria) {
    eventsQuery = ControlQuery.from(eventsCriteria);
  }

  return (source: Observable<SignedBlockExtended>)
        : Observable<ContractEventWithBlockEvent> => {
    return source.pipe(
      filterExtrinsics(extrinsicsCriteria),
      extractEventsWithTx(),
      contractEvents(abi, address),
      // Filters over the decoded event
      // if query or criteria is provided
      eventsQuery ?
        mongoFilter(eventsQuery, contracts) :
        x => x,
      // Share multicast
      share()
    );
  };
}