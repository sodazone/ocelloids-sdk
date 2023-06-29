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

/**
 *
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
      // Filters over the decoded message,
      // tx or event
      mongoFilter(callsQuery),
      // Share multicast
      share()
    );
  };
}

/**
 *
 * @param abi
 * @param address
 * @param eventsCriteria
 * @param extrinsicsCriteria
 * @returns
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
      mongoFilter(eventsQuery),
      // Share multicast
      share()
    );
  };
}