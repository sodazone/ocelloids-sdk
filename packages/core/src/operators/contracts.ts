import { isU8a } from '@polkadot/util';

import { Abi } from '@polkadot/api-contract';

import { Observable, map, share } from 'rxjs';

import { mongoFilterFrom } from './mongo-filter.js';
import { ContractEventWithBlockEvent, ContractMessageWithTx, EventWithId, TxWithIdAndEvent } from '../types/index.js';
import { callBaseToU8a, eventNamesToU8aBare } from '../converters/index.js';

/**
 * Returns an Observable that filters for contract call extrinsics based on the given address
 * and decodes the contract message based on the provided ABI.
 *
 * @param abiJson - The ABI of the contract as a JSON object or string.
 * @param address - The address of the contract.
 * @returns An Observable that emits ContractMessageWithTx objects.
 */
export function contractMessages(abiJson: Record<string, unknown> | string, address: string ) {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<ContractMessageWithTx> => {
    return (source.pipe(
      // Filter contract calls to contract at <address>
      mongoFilterFrom({
        'extrinsic.call.section': 'contracts',
        'extrinsic.call.method': 'call',
        'extrinsic.call.args.dest.id': address
      }),
      // Decode contract message and map to a ContractMessageWithTx object
      map(tx => {
        const { data } = callBaseToU8a(tx.extrinsic.method);
        return {
          ...tx,
          ...new Abi(abiJson).decodeMessage(data)
        };
      }),
      share()
    ));
  };
}

/**
 * Returns an Observable that filters and maps contract events based on the given ABI and address.
 *
 * @param abiJson - The ABI of the contract as a JSON object or string.
 * @param address - The address of the contract.
 * @returns An Observable that emits ContractEventWithBlockEvent objects.
 */
export function contractEvents(
  abiJson: Record<string, unknown> | string,
  address: string
) {
  return (source: Observable<EventWithId>): Observable<ContractEventWithBlockEvent> => {
    return source.pipe(
      // Filter `contracts.ContractEmitted` events emitted by contract at <address>
      mongoFilterFrom({
        'section': 'contracts',
        'method': 'ContractEmitted',
        'data.contract': address
      }),
      // Decode contract events and map to ContractEventWithBlockEvent objects
      map(blockEvent => {
        const eventData = eventNamesToU8aBare(blockEvent);

        const decodedEvent = isU8a(eventData)
          ? new Abi(abiJson).decodeEvent(eventData)
          : new Abi(abiJson).decodeEvent(eventData.data);

        return {
          blockEvent,
          ...decodedEvent
        };
      }),
      share()
    );
  };
}
