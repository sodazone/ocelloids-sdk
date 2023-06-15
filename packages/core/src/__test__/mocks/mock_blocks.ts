/* istanbul ignore file */

import { testBlocksFrom } from '../_blocks.js';
import { mockPolkadotApi } from './mock_polkadot.js';

export const testBlocks = testBlocksFrom('blocks.cbor.bin');
mockPolkadotApi({ testBlocks });

export { WsProvider } from '@polkadot/api';
export { SubstrateApis } from '../../apis/substrate-apis.js';
