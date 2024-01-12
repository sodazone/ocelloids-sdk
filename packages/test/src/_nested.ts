import type { TxWithEvent } from '@polkadot/api-derive/types';

import { testBlocksFrom } from './_blocks.js';
import rococoMetadata from './__data__/metadata/rococo-hex.js';
import westendMetadata from './__data__/metadata/westend-hex.js';

// Polkadot 16037760-2 multisig-proxy-proxy extrinsic
const testBlocks = testBlocksFrom('polkadot16037760.cbor.bin');
const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testNestedExtrinsic = testExtrinsics[2];
export const testNestedCalls = [
  {
    name: 'multisig.asMulti',
    events: testNestedExtrinsic.events
  },
  {
    name: 'proxy.proxy',
    events: testNestedExtrinsic.events.slice(0,7)
  },
  {
    name: 'proxy.proxy',
    events: testNestedExtrinsic.events.slice(0,6)
  },
  {
    name: 'convictionVoting.vote',
    events: testNestedExtrinsic.events.slice(0,5)
  }
];

// Rococo 8695659-2 batch-batch extrinsic
const testNestedBatchBlocks = testBlocksFrom('rococo8695659.cbor.bin', rococoMetadata);
const testNestedBatchExtrinsics = testNestedBatchBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testNestedBatchExtrinsic = testNestedBatchExtrinsics[2];
export const testNestedBatchCalls = [
  {
    name: 'utility.batch',
    events: testNestedBatchExtrinsic.events
  },
  {
    name: 'system.remark',
    events: testNestedBatchExtrinsic.events.slice(0,2)
  },
  {
    name: 'utility.batch',
    events: testNestedBatchExtrinsic.events.slice(2,7)
  },
  {
    name: 'balances.transferKeepAlive',
    events: testNestedBatchExtrinsic.events.slice(2,4)
  },
  {
    name: 'balances.transferKeepAlive',
    events: testNestedBatchExtrinsic.events.slice(4,5)
  },
  {
    name: 'balances.transferKeepAlive',
    events: []
  },
  {
    name: 'system.remark',
    events: testNestedBatchExtrinsic.events.slice(6,7)
  }
];

// Westend 10091936-2 batch-batchAll-batch-batchAll extrinsic
const testDeepNestedBlocks = testBlocksFrom('westend10091936.cbor.bin', westendMetadata);
const testDeepNestedExtrinsics = testDeepNestedBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testDeepNestedExtrinsic = testDeepNestedExtrinsics[2];
export const testDeepNestedCalls = [
  {
    name: 'utility.batch',
    events: testDeepNestedExtrinsic.events
  },
  {
    name: 'balances.transfer',
    events: testDeepNestedExtrinsic.events.slice(0,2)
  },
  {
    name: 'utility.batchAll',
    events: testDeepNestedExtrinsic.events.slice(2,6)
  },
  {
    name: 'utility.batch',
    events: testDeepNestedExtrinsic.events.slice(2,4)
  },
  {
    name: 'utility.batchAll',
    events: []
  },
  {
    name: 'balances.transfer',
    events: []
  },
  {
    name: 'balances.transfer',
    events: testDeepNestedExtrinsic.events.slice(6,7)
  }
];