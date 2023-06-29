import { DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

import { types } from '@sodazone/ocelloids';

/**
 * Represents a decoded contract message with associated extrinsic.
 */
export interface ContractMessageWithTx
extends types.TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}

export interface ContractConstructorWithTxAndEvents
extends ContractMessageWithTx {
  codeHash: string | null
}

/**
 * Represents a decoded contract event with the associated block event.
 */
export interface ContractEventWithBlockEvent
extends DecodedEvent {
  blockEvent: types.EventWithId
}