/* istanbul ignore file */

import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';
import metadataStatic from '../__data__/metadata/rococoContracts-hex.js';

import { testBlocksFrom } from '../_blocks.js';
import { testAbiFrom } from '../_abi.js';

export const testContractBlocks = testBlocksFrom('contracts2841323.cbor.bin', metadataStatic);
export const testContractExtrinsics = testContractBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testContractEvents = testContractBlocks.reduce((acc: EventRecord[], tb) => acc.concat(tb.events), []);
export const testContractAbi = testAbiFrom('erc20.json');
export const testContractAddress = '5Ee73nVsD1pLQEGkT4TfRQBR6cs7s4vnXWVAc2pCH8gZW12r';