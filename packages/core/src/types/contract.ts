import { DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

import { EventWithId, TxWithIdAndEvent } from './interfaces.js';

export interface ContractMessageWithTx
extends TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}

export interface ContractEventWithBlockEvent
extends DecodedEvent {
  blockEvent: EventWithId
}
