/* istanbul ignore file */

import { testBlocksFrom } from '../blocks.js';
import { mockPolkadotApi } from './polkadot.js';

export const testBlocks = testBlocksFrom('blocks.cbor.bin');
mockPolkadotApi({ testBlocks });

export { WsProvider } from '@polkadot/api';
export { SubstrateApis } from '../../apis/substrate-apis.js';
