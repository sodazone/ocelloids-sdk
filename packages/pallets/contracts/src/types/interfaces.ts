/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DecodedEvent, DecodedMessage } from '@polkadot/api-contract/types';

import { types } from '@sodazone/ocelloids';

/**
 * Represents a decoded contract message with associated extrinsic.
 */
export interface ContractMessageWithTx
extends types.TxWithIdAndEvent, DecodedMessage {
  // empty impl.
}

export type ContractConstructorWithTx = ContractMessageWithTx

/**
 * Represents a decoded contract event with the associated block event.
 */
export interface ContractEventWithBlockEvent
extends DecodedEvent {
  blockEvent: types.EventWithId
}