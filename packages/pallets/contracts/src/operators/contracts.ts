// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api'
import { Abi } from '@polkadot/api-contract'
import { EventRecord } from '@polkadot/types/interfaces'

import { Observable, filter, from, map, mergeMap, of, share } from 'rxjs'

import { mongoFilter, types } from '@sodazone/ocelloids-sdk'

import { ContractConstructorWithTx, ContractEventWithBlockEvent, ContractMessageWithTx } from '../types/interfaces.js'
import { AddressParam } from '../types/types.js'

// Note: We will extract this helper function along with the contracts pallet module
// when we add more pallet support
function getArgValueFromTx(extrinsic: types.ExtrinsicWithId, name: string) {
  const { args, argsDef } = extrinsic.method
  const keys = Object.keys(argsDef)
  const indexOfData = keys.findIndex((k) => k === name)
  return args[indexOfData]
}

/**
 * Returns an Observable that filters for contract call extrinsics based on the given address
 * and decodes the contract message based on the provided ABI.
 *
 * @param abi The ABI of the contract as a JSON object or string.
 * @param address The contract address or an array of addresses.
 * @returns An Observable that emits ContractMessageWithTx objects.
 */
export function contractMessages(abi: Abi, address: AddressParam) {
  const criteria = {
    'extrinsic.call.section': 'contracts',
    'extrinsic.call.method': 'call',
    'extrinsic.call.args.dest.id': Array.isArray(address) ? { $in: address } : address,
  }

  return (source: Observable<types.TxWithIdAndEvent>): Observable<ContractMessageWithTx> => {
    return source.pipe(
      mongoFilter(criteria),
      map((tx) => {
        const data = getArgValueFromTx(tx.extrinsic, 'data')
        return {
          ...tx,
          ...abi.decodeMessage(data.toU8a()),
        }
      }),
      share()
    )
  }
}

/**
 * Returns an Observable that filters for contract instantiations based on the given code hash
 * and decodes the contract constructor based on the provided ABI.
 *
 * @param api The ApiPromise instance for the network.
 * @param abi The contract ABI.
 * @param codeHash The contract code hash.
 *
 * @returns An observable that emits the decoded contract constructor with associated block event and transaction.
 */
export function contractConstructors(api: ApiPromise, abi: Abi, codeHash: string) {
  const criteria = {
    'extrinsic.call.section': 'contracts',
    'extrinsic.call.method': {
      $in: ['instantiate', 'instantiateWithCode'],
    },
  }

  return (source: Observable<types.TxWithIdAndEvent>): Observable<ContractConstructorWithTx> => {
    return source.pipe(
      mongoFilter(criteria),
      mergeMap((tx: types.TxWithIdAndEvent) => {
        const instantiatedEvent = tx.events.find((ev) => api.events.contracts.Instantiated.is(ev))

        if (instantiatedEvent !== undefined) {
          // We cast as any below to avoid importing `@polkadotjs/api-augment`
          // as we want to keep the library side-effects-free.
          // Since we have filtered for contracts.Instantiated events,
          // we can assume that the block event data has the structure:
          // {
          //   deployer: 'AccountId32',
          //   contract: 'AccountId32',
          // }
          const { contract } = instantiatedEvent.data as any

          return from(api.query.contracts.contractInfoOf(contract)).pipe(
            map((contractInfo: any) => {
              // contractInfo is of type Option<PalletContractsStorageContractInfo>
              if (contractInfo.isSome) {
                return {
                  tx,
                  contractCodeHash: contractInfo.unwrap().codeHash.toString(),
                }
              }
              return {
                tx,
                contractCodeHash: null,
              }
            })
          )
        }

        return of({
          tx,
          contractCodeHash: null,
        })
      }),
      filter(({ contractCodeHash }) => contractCodeHash === codeHash),
      map(({ tx }) => {
        const data = getArgValueFromTx(tx.extrinsic, 'data')
        return {
          ...tx,
          ...abi.decodeConstructor(data.toU8a()),
        }
      }),
      share()
    )
  }
}

/**
 * Returns an Observable that filters and maps contract events based on the given ABI and address.
 *
 * @param abi The ABI of the contract as a JSON object or string.
 * @param address The contract address or an array of addresses.
 * @returns An Observable that emits ContractEventWithBlockEvent objects.
 */
export function contractEvents(abi: Abi, address: AddressParam) {
  const criteria = {
    section: 'contracts',
    method: 'ContractEmitted',
    'data.contract': Array.isArray(address) ? { $in: address } : address,
  }

  return (source: Observable<types.EventWithIdAndTx>): Observable<ContractEventWithBlockEvent> => {
    return source.pipe(
      mongoFilter(criteria),
      map((blockEvent) => {
        // We cast as any below to avoid importing `@polkadotjs/api-augment`
        // as we want to keep the library side-effects-free.
        // Since we have filtered for contracts.ContractEmitted events,
        // we can assume that the block event data has the structure
        // {
        //   contract: 'AccountId32',
        //   data: 'Bytes',
        // }

        // TODO expects an EventRecord
        const decodedEvent = abi.decodeEvent({ event: blockEvent } as unknown as EventRecord)

        return {
          blockEvent,
          ...decodedEvent,
        }
      }),
      share()
    )
  }
}
