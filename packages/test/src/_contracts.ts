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