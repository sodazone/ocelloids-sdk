/* istanbul ignore file */

import { mockPolkadotApi } from './mock_polkadot.js';
mockPolkadotApi();

export { WsProvider } from '@polkadot/api';
export { SubstrateApis } from '../../apis/substrate-apis.js';