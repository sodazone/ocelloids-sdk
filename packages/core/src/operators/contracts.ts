import { isU8a } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import { Observable, concatMap, filter, map, share } from 'rxjs';

import { mongoFilterFrom } from './mongo-filter.js';
import {
  ContractConstructorWithEventAndTx,
  ContractEventWithBlockEvent,
  ContractMessageWithTx,
  EventWithId,
  EventWithIdAndTx,
  TxWithIdAndEvent
} from '../types/index.js';
import { callBaseToU8a, eventNamesToU8aBare } from '../converters/index.js';

/**
 * Returns an Observable that filters for contract call extrinsics based on the given address
 * and decodes the contract message based on the provided ABI.
 *
 * @param abiJson - The ABI of the contract as a JSON object or string.
 * @param address - The address of the contract.
 * @returns An Observable that emits ContractMessageWithTx objects.
 */
export function contractMessages(abi: Abi, address: string ) {
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
          ...abi.decodeMessage(data)
        };
      }),
      share()
    ));
  };
}

export function contractConstructors(api: ApiPromise, abi: Abi, codeHash: string ) {
  return (source: Observable<EventWithIdAndTx>)
  : Observable<ContractConstructorWithEventAndTx> => {
    return (source.pipe(
      // Filter contract instantiated events
      mongoFilterFrom({
        'section': 'contracts',
        'method': 'Instantiated'
      }),
      concatMap(async (blockEvent: EventWithIdAndTx) => {
        let contractCodeHash = null;
        if (api.events.contracts.Instantiated.is(blockEvent)) {
          // We cast as any here to avoid importing `@polkadotjs/api-augment`
          // as we want to keep the library side-effects-free
          const { contract } = blockEvent.data as any;

          const contractInfo = ((await api.query.contracts.contractInfoOf(contract)) as any).unwrapOr(null);

          if (contractInfo !== null) {
            contractCodeHash = contractInfo.codeHash.toString();
          }
        }
        return {
          blockEvent,
          contractCodeHash
        };
      }),
      filter(({ contractCodeHash }) => contractCodeHash === codeHash),
      map(({ blockEvent, contractCodeHash }) => {
        const { data } = callBaseToU8a(blockEvent.extrinsic.method);
        return {
          blockEvent,
          codeHash: contractCodeHash,
          ...abi.decodeConstructor(data)
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
  abi: Abi,
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
          ? abi.decodeEvent(eventData)
          : abi.decodeEvent(eventData.data);

        return {
          blockEvent,
          ...decodedEvent
        };
      }),
      share()
    );
  };
}
