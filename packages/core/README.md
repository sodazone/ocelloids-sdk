# Ocelloids Core Module

<a href="https://www.npmjs.com/package/@sodazone/ocelloids-sdk">
  <img 
    src="https://img.shields.io/npm/v/@sodazone/ocelloids-sdk?color=69D2E7&labelColor=69D2E7&logo=npm&logoColor=333333"
    alt="npm @sodazone/ocelloids-sdk"
  />
</a>

The Ocelloids Core Module provides base abstractions, reactive operators, and pallet-independent functionality.

## Layout

The `packages/core` module source folder is structured as follows:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
|  apis                        | Multi-chain APIs                          |
|  configuration               | Configuration                             |
|  converters                  | Chain data type conversions               |
|  observables                 | Reactive emitters                         |
|  operators                   | Reactive operators                        |
|  subjects                    | Reactive subjects                         |
|  types                       | Extended types                            |

## Usage

Refer to the [SDK documentation](https://sodazone.github.io/ocelloids-sdk/).

Additionally, check out the [examples/](https://github.com/sodazone/ocelloids-sdk/tree/main/examples) folder for example applications.

## Logging

Ocelloids supports configuring debug logger outputs to aid in development.

The table below displays the available loggers and their descriptions:

| Logger Name | Description |
| ----------- | ----------- |
| oc-ops-mongo-filter | Prints the transformed object data in "named primitive" format before filtering in the `mongo-filter` operator. |
| oc-ops-flatten  | Prints extrinsic call flattening details. |
| oc-blocks | Prints the current block number in block-related observables. |
| oc-substrate-apis | Prints initialisation data of Substrate APIs. |

To enable debugging logs for a specific category, use the `DEBUG` environment variable with the corresponding logger name.

For example, to enable debugging logs for the "oc-ops-mongo-filter" category, you can run the following command:

```shell
DEBUG=oc-ops-mongo-filter yarn filter-fee-events
```

You can specify multiple logger names separated by a comma, as shown in the example below:

```shell
DEBUG=oc-ops-mongo-filter,oc-blocks yarn filter-fee-events
```

These loggers provide valuable information that can assist with data filtering and tracking contextual information.

## Custom Methods and Types

When instantiating the APIs, you have the flexibility to register custom RPC and runtime methods, as well as define custom types for the networks you're interacting with.

Here's a simple demonstration:

```typescript
import { WsProvider } from '@polkadot/api';

import { SubstrateApis } from '@sodazone/ocelloids-sdk';

const apis = new SubstrateApis({
  network: {
    provider: new WsProvider('wss://my-custom-rpc.io'),
    rpc: {
      // custom RPC methods
    },
    runtime: {
      // custome runtime methods
    },
    types: [
      {
        "minmax": [
          0,
          null
        ],
        types: {
          // custom types
        }
      }
    ]
  },
});
```

For more detailed information on extending types and methods in the API, please refer to the Polkadot.js documentation on [Extending Types](https://polkadot.js.org/docs/api/start/types.extend) and [Custom RPC](https://polkadot.js.org/docs/api/start/rpc.custom).

You can also explore a practical example of how custom methods and types are registered in the [watch-contracts](https://github.com/sodazone/ocelloids-sdk/tree/main/examples/watch-contracts) example application.

## Nested Calls Flattener

The `CorrelatedFlattener`, a specialized helper class, recursively extracts all nested calls from a given extrinsic. It assigns the subset of events within that extrinsic to each call and maps any execution errors to the extracted calls. This is particularly useful when dealing with extrinsics that contain nested batch, multisig, or proxy calls.

A `BasicFlattener` is also provided to skip event correlation while still extracting nested calls.

The flatteners are used within the `flattenCalls` operator and are also exported for external use, such as in an observer handler:

```javascript
// Flatten and log extrinsic 8695536-2 on Rococo ([Subscan link](https://rococo.subscan.io/extrinsic/8695536-2))
apis.rx.polkadot.pipe(
  blocksInRange(8695536, 1),
  extractTxWithEvents(), // Simply extract TxWithIdAndEvents without flattening or filtering
  filter(tx => tx.extrinsic.extrinsicId === '8695536-2') // Filter for only the `forceBatch` extrinsic
).subscribe(tx => {
  // Initialise flattener and flatten nested calls
  const flattener = new CorrelatedFlattener(tx);
  flattener.flatten();
  const calls = flattener.flattenedCalls;
  calls.forEach(c => {
    console.log('==============================================================================');
    console.log('Extrinsic:', c.extrinsic.method.toHuman());
    console.log('Events:', c.events.map(e => e.toHuman()));
    console.log('Execution results:', c.dispatchError ? c.dispatchError.toHuman() : 'Success');
  });
});
```

You will see the following output:

<details>
<summary>Flattened calls - click to expand</summary>

```
============================
Extrinsic: {
  args: { calls: [ [Object], [Object], [Object] ] },
  method: 'forceBatch',
  section: 'utility'
}
Events: [
  {
    method: 'BatchCompleted',
    section: 'utility',
    index: '0x1801',
    data: {}
  },
  {
    method: 'Deposit',
    section: 'balances',
    index: '0x0407',
    data: {
      who: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW',
      amount: '121,680'
    }
  },
  {
    method: 'Deposit',
    section: 'balances',
    index: '0x0407',
    data: {
      who: '5Ef7wVYfsmCiCNfDzzFFt9zpz2tPgZ114s5NueMkVCjj7ZSQ',
      amount: '100,384,984'
    }
  },
  {
    method: 'TransactionFeePaid',
    section: 'transactionPayment',
    index: '0x2100',
    data: {
      who: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW',
      actualFee: '100,384,984',
      tip: '0'
    }
  },
  {
    method: 'ExtrinsicSuccess',
    section: 'system',
    index: '0x0000',
    data: { dispatchInfo: [Object] }
  }
]
Execution results: Success
============================
Extrinsic: {
  args: { remark: '0x540d0053ef00540d00ff0c00975e005e3800540d' },
  method: 'remark',
  section: 'system'
}
Events: [
  {
    method: 'ItemCompleted',
    section: 'utility',
    index: '0x1803',
    data: {}
  }
]
Execution results: Success
============================
Extrinsic: {
  args: { calls: [ [Object], [Object], [Object] ] },
  method: 'forceBatch',
  section: 'utility'
}
Events: [
  {
    method: 'BatchCompletedWithErrors',
    section: 'utility',
    index: '0x1802',
    data: {}
  },
  {
    method: 'ItemCompleted',
    section: 'utility',
    index: '0x1803',
    data: {}
  }
]
Execution results: Success
============================
Extrinsic: {
  args: {
    dest: { Id: '5FLPbcLRQBqU3UCaNJCDF4bGify3Eor2dj3f4kxJq3szgeC5' },
    value: '2,000,000,000,000'
  },
  method: 'transferKeepAlive',
  section: 'balances'
}
Events: [
  {
    method: 'Transfer',
    section: 'balances',
    index: '0x0402',
    data: {
      from: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW',
      to: '5FLPbcLRQBqU3UCaNJCDF4bGify3Eor2dj3f4kxJq3szgeC5',
      amount: '2,000,000,000,000'
    }
  },
  {
    method: 'ItemCompleted',
    section: 'utility',
    index: '0x1803',
    data: {}
  }
]
Execution results: Success
============================
Extrinsic: {
  args: {
    dest: { Id: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW' },
    value: '1,000,000,000,000,000,000,000'
  },
  method: 'transferKeepAlive',
  section: 'balances'
}
Events: [
  {
    method: 'ItemFailed',
    section: 'utility',
    index: '0x1804',
    data: { error: [Object] }
  }
]
Execution results: { Arithmetic: 'Underflow' }
============================
Extrinsic: {
  args: {
    dest: { Id: '5HKLQkkz5ifs43BRHmZKe5DevTYY1iRiNp6CPHkM8sv3ZXPb' },
    value: '3,000,000,000,000'
  },
  method: 'transferKeepAlive',
  section: 'balances'
}
Events: [
  {
    method: 'Transfer',
    section: 'balances',
    index: '0x0402',
    data: {
      from: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW',
      to: '5HKLQkkz5ifs43BRHmZKe5DevTYY1iRiNp6CPHkM8sv3ZXPb',
      amount: '3,000,000,000,000'
    }
  },
  {
    method: 'ItemCompleted',
    section: 'utility',
    index: '0x1803',
    data: {}
  }
]
Execution results: Success
============================
Extrinsic: {
  args: { remark: '0x90530053ef00905300ff0c00975e005e38009053' },
  method: 'remark',
  section: 'system'
}
Events: [
  {
    method: 'Withdraw',
    section: 'balances',
    index: '0x0408',
    data: {
      who: '5GEse7uuvXbkNFi6o8WeaL1S5omApVB4D9oFjEm7791BuLXW',
      amount: '100,506,664'
    }
  },
  {
    method: 'ItemCompleted',
    section: 'utility',
    index: '0x1803',
    data: {}
  }
]
Execution results: Success
```
</details>

