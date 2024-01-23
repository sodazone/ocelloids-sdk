import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { Event } from '@polkadot/types/interfaces';

import { testBlocksFrom } from './_blocks.js';
import rococoMetadata from './__data__/metadata/rococo-hex.js';
import westendMetadata from './__data__/metadata/westend-hex.js';

export type NestedCallToMatch = {
  name: string;
  events: Event[];
  origins: {
    type: string,
    address: string
  }[],
  levelId?: string,
  dispatchError: Record<string, any> | undefined
}

// Polkadot 16037760-2 multisig-proxy-proxy extrinsic
const testBlocks = testBlocksFrom('polkadot16037760.cbor.bin');
const testExtrinsics = testBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testNestedExtrinsic = testExtrinsics[2];
export const testNestedCalls: NestedCallToMatch[] = [
  {
    levelId: '0',
    name: 'multisig.asMulti',
    events: testNestedExtrinsic.events.slice(7),
    origins: [
      {
        type: 'multisig',
        address: '17BA8dMH2ZDBJJNDf2UqvwJJ9xWQus6y1y7bhS3Lp9CHLuQ'
      },
      {
        type: 'proxy',
        address: '12easLRmTHY2AGmsYoxKsm967bdc5RfuqFFQt2LVG5Qvf6EP'
      },
      {
        type: 'proxy',
        address: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK'
      }
    ],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'proxy.proxy',
    events: testNestedExtrinsic.events.slice(6,7),
    origins: [
      {
        type: 'multisig',
        address: '17BA8dMH2ZDBJJNDf2UqvwJJ9xWQus6y1y7bhS3Lp9CHLuQ'
      },
      {
        type: 'proxy',
        address: '12easLRmTHY2AGmsYoxKsm967bdc5RfuqFFQt2LVG5Qvf6EP'
      },
      {
        type: 'proxy',
        address: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK'
      }
    ],
    dispatchError: undefined
  },
  {
    levelId: '0.0.0',
    name: 'proxy.proxy',
    events: testNestedExtrinsic.events.slice(5,6),
    origins: [
      {
        type: 'multisig',
        address: '17BA8dMH2ZDBJJNDf2UqvwJJ9xWQus6y1y7bhS3Lp9CHLuQ'
      },
      {
        type: 'proxy',
        address: '12easLRmTHY2AGmsYoxKsm967bdc5RfuqFFQt2LVG5Qvf6EP'
      },
      {
        type: 'proxy',
        address: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK'
      }
    ],
    dispatchError: undefined
  },
  {
    levelId: '0.0.0.0',
    name: 'convictionVoting.vote',
    events: testNestedExtrinsic.events.slice(0,5),
    origins: [
      {
        type: 'multisig',
        address: '17BA8dMH2ZDBJJNDf2UqvwJJ9xWQus6y1y7bhS3Lp9CHLuQ'
      },
      {
        type: 'proxy',
        address: '12easLRmTHY2AGmsYoxKsm967bdc5RfuqFFQt2LVG5Qvf6EP'
      },
      {
        type: 'proxy',
        address: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK'
      }
    ],
    dispatchError: undefined
  }
];

// Rococo 8695659-2 batch-batch extrinsic
const testNestedBatchBlocks = testBlocksFrom('rococo8695659.cbor.bin', rococoMetadata);
const testNestedBatchExtrinsics = testNestedBatchBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testNestedBatchExtrinsic = testNestedBatchExtrinsics[2];
export const testNestedBatchCalls: NestedCallToMatch[] = [
  {
    levelId: '0',
    name: 'utility.batch',
    events: testNestedBatchExtrinsic.events.slice(7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.2',
    name: 'system.remark',
    events: testNestedBatchExtrinsic.events.slice(6,7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1',
    name: 'utility.batch',
    events: testNestedBatchExtrinsic.events.slice(4,6),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1.2',
    name: 'balances.transferKeepAlive',
    events: [],
    origins: [],
    dispatchError: {
      'Arithmetic': 'Underflow'
    }
  },
  {
    levelId: '0.1.1',
    name: 'balances.transferKeepAlive',
    events: [],
    origins: [],
    dispatchError: {
      'Arithmetic': 'Underflow'
    }
  },
  {
    levelId: '0.1.0',
    name: 'balances.transferKeepAlive',
    events: testNestedBatchExtrinsic.events.slice(2,4),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'system.remark',
    events: testNestedBatchExtrinsic.events.slice(0,2),
    origins: [],
    dispatchError: undefined
  }
];

// Rococo 8695536-2 forceBatch-forceBatch extrinsic
const testForceBatchBlocks = testBlocksFrom('rococo8695536.cbor.bin', rococoMetadata);
const testForceBatchExtrinsics = testForceBatchBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testForceBatchExtrinsic = testForceBatchExtrinsics[2];
export const testForceBatchCalls: NestedCallToMatch[] = [
  {
    levelId: '0',
    name: 'utility.forceBatch',
    events: testForceBatchExtrinsic.events.slice(10),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'system.remark',
    events: testForceBatchExtrinsic.events.slice(0, 2),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1',
    name: 'utility.forceBatch',
    events: testForceBatchExtrinsic.events.slice(7, 9),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1.0',
    name: 'balances.transferKeepAlive',
    events: testForceBatchExtrinsic.events.slice(2, 4),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1.1',
    name: 'balances.transferKeepAlive',
    events: testForceBatchExtrinsic.events.slice(4, 5),
    origins: [],
    dispatchError: {
      'Arithmetic': 'Underflow'
    }
  },
  {
    levelId: '0.1.2',
    name: 'balances.transferKeepAlive',
    events: testForceBatchExtrinsic.events.slice(5, 7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.2',
    name: 'system.remark',
    events: testForceBatchExtrinsic.events.slice(9, 10),
    origins: [],
    dispatchError: undefined
  }
];

// Westend 10091936-2 batch-batchAll-batch-batchAll extrinsic
const testDeepNestedBlocks = testBlocksFrom('westend10091936.cbor.bin', westendMetadata);
const testDeepNestedExtrinsics = testDeepNestedBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testDeepNestedExtrinsic = testDeepNestedExtrinsics[2];
export const testDeepNestedCalls: NestedCallToMatch[] = [
  {
    levelId: '0',
    name: 'utility.batch',
    events: testDeepNestedExtrinsic.events.slice(7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'balances.transfer',
    events: testDeepNestedExtrinsic.events.slice(0,2),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1',
    name: 'utility.batchAll',
    events: testDeepNestedExtrinsic.events.slice(4,6),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1.0',
    name: 'utility.batch',
    events: testDeepNestedExtrinsic.events.slice(2,4),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1.0.0',
    name: 'utility.batchAll',
    events: [],
    origins: [],
    dispatchError: {
      'Module': {
        'index': '0',
        'error': '5'
      }
    }
  },
  {
    levelId: '0.1.0.0.0',
    name: 'balances.transfer',
    events: [],
    origins: [],
    dispatchError: {
      'Module': {
        'index': '0',
        'error': '5'
      }
    }
  },
  {
    levelId: '0.2',
    name: 'balances.transfer',
    events: testDeepNestedExtrinsic.events.slice(6,7),
    origins: [],
    dispatchError: undefined
  }
];

// Polkadot 18977445-2 multisig-proxy-proxy extrinsic
const testMultisigThreshold1Blocks = testBlocksFrom('polkadot18977445.cbor.bin');
const testMultisigThreshold1Extrinsics = testMultisigThreshold1Blocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
export const testMultisigThreshold1Extrinsic = testMultisigThreshold1Extrinsics[2];
export const testMultisigThreshold1Calls: NestedCallToMatch[] = [
  {
    levelId: '0',
    name: 'multisig.asMultiThreshold1',
    events: [],
    origins: [
      {
        type: 'multisig',
        address: '13tpYpgt83Fv9oJoKSYotaMiGCD4quww4jTjpd2tFXos49pE'
      }
    ],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'nominationPools.join',
    events: testMultisigThreshold1Extrinsic.events,
    origins: [
      {
        type: 'multisig',
        address: '13tpYpgt83Fv9oJoKSYotaMiGCD4quww4jTjpd2tFXos49pE'
      }
    ],
    dispatchError: undefined
  }
];