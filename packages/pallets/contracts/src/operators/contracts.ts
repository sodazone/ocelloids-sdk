import { ApiPromise } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import { Observable, concatMap, filter, map, share } from 'rxjs';

import { mongoFilterFrom, types } from '@sodazone/ocelloids';

import { ContractConstructorWithEventAndTx, ContractEventWithBlockEvent, ContractMessageWithTx } from '../types/interfaces.js';

// Note: We will extract this helper function along with the contracts pallet module
// when we add more pallet support
function getArgValueFromTx(extrinsic: types.ExtrinsicWithId, name: string) {
  const { args, argsDef } = extrinsic.method;
  const keys = Object.keys(argsDef);
  const indexOfData = keys.findIndex(k => k === name);
  return args[indexOfData];
}

/**
 * Returns an Observable that filters for contract call extrinsics based on the given address
 * and decodes the contract message based on the provided ABI.
 *
 * @param abiJson - The ABI of the contract as a JSON object or string.
 * @param address - The address of the contract.
 * @returns An Observable that emits ContractMessageWithTx objects.
 */
export function contractMessages(abi: Abi, address: string ) {
  return (source: Observable<types.TxWithIdAndEvent>)
  : Observable<ContractMessageWithTx> => {
    return (source.pipe(
      mongoFilterFrom(
        {
          'extrinsic.call.section': 'contracts',
          'extrinsic.call.method': 'call',
          'extrinsic.call.args.dest.id': address
        }
      ),
      map(tx => {
        const data = getArgValueFromTx(tx.extrinsic, 'data');
        return {
          ...tx,
          ...abi.decodeMessage(data.toU8a())
        };
      }),
      share()
    ));
  };
}

/**
 * Returns an Observable that filters for contract instantiations based on the given code hash
 * and decodes the contract constructor based on the provided ABI.
 *
 * @param api - The ApiPromise instance for the network.
 * @param abi - The contract ABI.
 * @param codeHash - The contract code hash.
 *
 * @returns An observable that emits the decoded contract constructor with associated block event and transaction.
 */
export function contractConstructors(api: ApiPromise, abi: Abi, codeHash: string ) {
  return (source: Observable<types.EventWithIdAndTx>)
  : Observable<ContractConstructorWithEventAndTx> => {
    return (source.pipe(
      filter((blockEvent: types.EventWithIdAndTx) =>
        api.events.contracts.Instantiated.is(blockEvent)
      ),
      // Use concatMap to allow for async call to promise API to get contract code hash,
      // map to contractCodeHash property to be used for filtering in the next step.
      // This is necessary as we cannot make an async call in rxjs `filter` operator
      concatMap(async (blockEvent: types.EventWithIdAndTx) => {
        let contractCodeHash: string | null = null;
        // We cast as any below to avoid importing `@polkadotjs/api-augment`
        // as we want to keep the library side-effects-free.
        // Since we have filtered for contracts.Instantiated events,
        // we can assume that the block event data has the structure:
        // {
        //   deployer: 'AccountId32',
        //   contract: 'AccountId32',
        // }
        const { contract } = blockEvent.data as any;
        // contractInfo is of type Option<PalletContractsStorageContractInfo>
        const contractInfo = (await api.query.contracts.contractInfoOf(contract)) as any;

        if (contractInfo.isSome) {
          contractCodeHash = contractInfo.unwrap().codeHash.toString();
        }

        return {
          blockEvent,
          contractCodeHash
        };
      }),
      filter(({ contractCodeHash }) => contractCodeHash === codeHash),
      map(({ blockEvent, contractCodeHash }) => {
        const data = getArgValueFromTx(blockEvent.extrinsic, 'data');
        return {
          blockEvent,
          codeHash: contractCodeHash,
          ...abi.decodeConstructor(data.toU8a())
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
  return (source: Observable<types.EventWithIdAndTx>): Observable<ContractEventWithBlockEvent> => {
    return source.pipe(
      mongoFilterFrom(
        {
          'section': 'contracts',
          'method': 'ContractEmitted',
          'data.contract': address
        }
      ),
      map(blockEvent => {
        // We cast as any below to avoid importing `@polkadotjs/api-augment`
        // as we want to keep the library side-effects-free.
        // Since we have filtered for contracts.ContractEmitted events,
        // we can assume that the block event data has the structure
        // {
        //   contract: 'AccountId32',
        //   data: 'Bytes',
        // }
        const { data } = blockEvent.data as any;
        const decodedEvent = abi.decodeEvent(data.toU8a(true));

        return {
          blockEvent,
          ...decodedEvent
        };
      }),
      share()
    );
  };
}
