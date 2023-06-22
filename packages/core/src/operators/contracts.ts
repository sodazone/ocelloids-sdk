import type { AnyJson, ArgsDef, AnyTuple, Codec } from '@polkadot/types-codec/types';
import type { TxWithEvent } from '@polkadot/api-derive/types';

import { stringToU8a } from '@polkadot/util';

import { Abi } from '@polkadot/api-contract';
import { AbiParam } from '@polkadot/api-contract/types';

import { Observable, map, share } from 'rxjs';

import { ContractMessageWithTx, TxWithIdAndEvent, callBaseToCodec, mongoFilterFrom } from '../index.js';

export function contractCalls(abiJson: Record<string, unknown> | string, address: string ) {
  return (source: Observable<TxWithIdAndEvent>)
  : Observable<ContractMessageWithTx> => {
    return (source.pipe(
      mongoFilterFrom({
        'extrinsic.call.section': 'contracts',
        'extrinsic.call.method': 'call',
        'extrinsic.call.args.dest.id': address
      }),
      map(tx => {
        const { data } = callBaseToCodec(tx.extrinsic.method);
        return {
          ...tx,
          ...new Abi(abiJson).decodeMessage(data.toU8a())
        };
      }),
      share()
    ));
  };
}