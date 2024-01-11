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

/* istanbul ignore file */

import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord, Event } from '@polkadot/types/interfaces';
import metadataStatic from './__data__/metadata/rococoContracts-hex.js';

import { testBlocksFrom } from './_blocks.js';
import { testMetadataFrom } from './_abi.js';

export const testContractBlocks = testBlocksFrom('contracts2841323.cbor.bin', metadataStatic);
export const testContractExtrinsics = testContractBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testContractEventRecords = testContractBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), []);
export const testContractEvents = testContractExtrinsics.reduce((acc: Event[], txt) => acc.concat(txt.events), []);
export const testContractMetadata = testMetadataFrom('erc20.json');
export const testContractAddress = '5Ee73nVsD1pLQEGkT4TfRQBR6cs7s4vnXWVAc2pCH8gZW12r';
export const testContractCodeHash = '0xb1fc0d2c3df7250059748b65eb7ac72611bcaff728cc44b7aa8a27cd22a95417';