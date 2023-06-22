import { DecodedMessage } from '@polkadot/api-contract/types';

import { TxWithIdAndEvent } from './extrinsic.js';

export interface ContractMessageWithTx
extends TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}