import { DecodedMessage } from '@polkadot/api-contract/types';

import { TxWithIdAndEvent } from './interfaces.js';

export interface ContractMessageWithTx
extends TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}
