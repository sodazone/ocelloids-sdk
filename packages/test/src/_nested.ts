import type { TxWithEvent } from '@polkadot/api-derive/types';
import type { Event, EventRecord } from '@polkadot/types/interfaces';

import { testBlocksFrom } from './_blocks.js';
import rococoMetadata from './__data__/metadata/rococo-hex.js';
import westendMetadata from './__data__/metadata/westend-hex.js';

export type DataToMatch = {
  name: string;
  events: Event[];
  origins: {
    type: string,
    address: string
  }[],
  levelId?: string,
  dispatchError: Record<string, any> | undefined
}

export type TestItem = {
  extrinsic: TxWithEvent,
  events: EventRecord[],
  data: DataToMatch[]
}

// Polkadot 16037760-2 multisig-proxy-proxy extrinsic
const testMultisigProxyBlocks = testBlocksFrom('polkadot16037760.cbor.bin');
const testMultisigProxyExtrinsics = testMultisigProxyBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
const testMultisigProxyExtrinsic = testMultisigProxyExtrinsics[2];
const testMultisigProxyEvents = testMultisigProxyBlocks[0].events;
const testMultisigProxyData: DataToMatch[] = [
  {
    levelId: '0',
    name: 'multisig.asMulti',
    events: testMultisigProxyExtrinsic.events.slice(7),
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
    events: testMultisigProxyExtrinsic.events.slice(6,7),
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
    events: testMultisigProxyExtrinsic.events.slice(5,6),
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
    events: testMultisigProxyExtrinsic.events.slice(0,5),
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
const testBatchBlocks = testBlocksFrom('rococo8695659.cbor.bin', rococoMetadata);
const testBatchExtrinsics = testBatchBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
const testBatchExtrinsic = testBatchExtrinsics[2];
const testBatchEvents = testBatchBlocks[0].events;
const testBatchData: DataToMatch[] = [
  {
    levelId: '0',
    name: 'utility.batch',
    events: testBatchExtrinsic.events.slice(7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.2',
    name: 'system.remark',
    events: testBatchExtrinsic.events.slice(6,7),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.1',
    name: 'utility.batch',
    events: testBatchExtrinsic.events.slice(4,6),
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
    events: testBatchExtrinsic.events.slice(2,4),
    origins: [],
    dispatchError: undefined
  },
  {
    levelId: '0.0',
    name: 'system.remark',
    events: testBatchExtrinsic.events.slice(0,2),
    origins: [],
    dispatchError: undefined
  }
];

// Rococo 8695536-2 forceBatch-forceBatch extrinsic
const testForceBatchBlocks = testBlocksFrom('rococo8695536.cbor.bin', rococoMetadata);
const testForceBatchExtrinsics = testForceBatchBlocks.reduce((acc: TxWithEvent[], tb) => acc.concat(tb.extrinsics), []);
const testForceBatchExtrinsic = testForceBatchExtrinsics[2];
const testForceBatchEvents = testForceBatchBlocks[0].events;
const testForceBatchData: DataToMatch[] = [
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
const testDeepNestedExtrinsic = testDeepNestedExtrinsics[2];
const testDeepNestedEvents = testDeepNestedBlocks[0].events;
const testDeepNestedData: DataToMatch[] = [
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
const testMultisigThreshold1Extrinsic = testMultisigThreshold1Extrinsics[2];
const testMultisigThreshold1Events = testMultisigThreshold1Blocks[0].events;
const testMultisigThreshold1Data: DataToMatch[] = [
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

export const nestedItems = {
  testMultisigProxy: {
    extrinsic: testMultisigProxyExtrinsic,
    events: testMultisigProxyEvents,
    data: testMultisigProxyData
  },
  testBatch: {
    extrinsic: testBatchExtrinsic,
    events: testBatchEvents,
    data: testBatchData
  },
  testForceBatch: {
    extrinsic: testForceBatchExtrinsic,
    events: testForceBatchEvents,
    data: testForceBatchData
  },
  testDeepNested: {
    extrinsic: testDeepNestedExtrinsic,
    events: testDeepNestedEvents,
    data: testDeepNestedData
  },
  testMultisigThreshold1: {
    extrinsic: testMultisigThreshold1Extrinsic,
    events: testMultisigThreshold1Events,
    data: testMultisigThreshold1Data
  }
} as {
  testMultisigProxy: TestItem,
  testBatch: TestItem,
  testForceBatch: TestItem,
  testDeepNested: TestItem,
  testMultisigThreshold1: TestItem
};