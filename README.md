<div align="center">

# Ocelloids
Substrate monitoring SDK

<img
  src="https://github.com/sodazone/ocelloids/blob/main/.github/assets/ocesp_250-min.png?raw=true"
  width="250"
  height="auto"
  alt=""
/>

![npm](https://img.shields.io/npm/v/sodazone/ocelloids?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/sodazone/ocelloids?style=for-the-badge)

</div>

---

**Etymology** _ocellus_ + _-oid_

**Noun** ocelloid (_plural_ ocelloids)

>  “(microbiology) a cellular structure found in unicellular microorganisms that is analogous in structure and function to eyes, which focus, process and detect light.”

---

Ocelloids is an open-source software development kit (SDK) that provides a framework for building monitoring applications specifically designed for Substrate-based networks.
With Ocelloids you can easily implement sophisticated multi-chain monitoring logic.

## Features

* **Composable Reactive Streams** — Easily source, transform, and react to blockchain data using composable reactive streams.
* **Powerful Query Operators** — Data filtering with integrated operators that support complex queries in the Mongo query language, including support for big numbers and advanced features such as dynamic queries.
* **Flexible Type Conversions** — Seamlessly convert data into a terse queryable format.
* **Extended Context Types** — Extends the base generic events and existrincs with contextual information such as position in block, block number, position in extrinsic, etc.
* **Abstraction of Common Patterns** — Simplify development and reduce boilerplate code by abstracting common patterns such as utility batch calls.
* **Multi-Chain Support** — Interact with multiple networks.
* **Pallet-Specific Modules** — Modules designed to handle use cases related to a particular pallet, such as tracking calls and events from the contracts pallet.

## Usage

### Example: Filtering Balance Transfer Events

Here's an example showcasing the usage of Ocelloids to filter out balance transfer events above a certain amount:

```typescript
import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  finalizedBlocks,
  filterEvents
} from '@sodazone/ocelloids';

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider('wss://rpc.polkadot.io')
  }
});

apis.rx.polkadot.pipe(
  finalizedBlocks(),
  filterEvents({
    section: 'balances',
    method: 'Transfer',
    'data.amount': { $bn_gte: '50000000000' }
  })
).subscribe(
  x => console.log(x.toHuman())
);
```

Output with contextual information:

```javascript
{
  eventId: '16134479-5-1',
  extrinsicId: '16134479-5',
  extrinsicPosition: 1,
  blockNumber: '16,134,479',
  method: 'Transfer',
  section: 'balances',
  index: '0x0502',
  data: {
    from: '14GuP6QAfK9uwo3MQ9LrcmEqttcrtoNfDaSHn2BVaYcJJBg6',
    to: '12But7r26e2UwZkSYC8bU5nQdyfqWXswZEwS1tbH9nD8CXvK',
    amount: '54,719,854,400'
  }
}
```

The event identifier `eventId` consists of the block number, the position of the extrinsic within the block,
and the position of the event within the extrinsic.

The `filterEvents` operator used in the example is composed of the following stack:

```typescript
source.pipe(
  // Extracts extrinsics with events
  extractTxWithEvents(),
  
  // Flattens batches if needed
  flattenBatch(),
  
  // Filters at the extrinsic level
  // mainly for success or failure
  mongoFilterFrom(extrinsicsCriteria),
  
  // Maps the events with
  // block and extrinsic context
  mapEventsWithContext(),
  
  // Filters over the events
  mongoFilter(eventsQuery),
  
  // Share multicast
  share()
)
```

### Example: Dynamic Query

Now let's explore a more advanced example with a dynamic query that collects seen addresses, starting from ALICE address:

<details>
<summary>Dynamic query example - click to expand</summary>

```typescript
import { WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';

import {
  SubstrateApis,
  blocksInRange,
  filterEvents,
  ControlQuery
} from '@sodazone/ocelloids';

function transfersOf(addresses: string[]) {
  return ControlQuery.from({
    $and: [
      { section: 'balances' },
      { method: 'Transfer' },
      {
        $or: [
          { 'data.from': { $in: addresses } },
          { 'data.to': { $in: addresses } }
        ]
      }
    ]
  });
}

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider('wss://rpc.polkadot.io')
  }
});

const seenAddresses = new Set<string>([ALICE]);
let dynamicQuery = transfersOf([...seenAddresses]);

apis.rx.polkadot.pipe(
  blocksInRange(16134439, 100),
  filterEvents(dynamicQuery)
).subscribe(event => {
  console.log('Event: ', event.toHuman());

  if (apis.promise.polkadot.events.balances.Transfer.is(event) ) {
    const transfer = event.data;
    const from = transfer.from.toPrimitive();
    const to = transfer.to.toPrimitive();

    seenAddresses.add(from);
    seenAddresses.add(to);

    // Updates dynamic query, probably you want
    // to update it only for new seen addresses
    dynamicQuery.change(transfersOf([...seenAddresses]));
  }
});
```
</details>

In this advanced example, we introduce the concept of a dynamic query.
We initialize `seenAddresses` with ALICE, and the `dynamicQuery` with the initial filter.
As new addresses are encountered, the dynamic query is updated.

## Development

### Requirements

To contribute to the development of Ocelloids, ensure that you have the following requirements installed:

* [Node.js](https://nodejs.org/en/) >=18.14
* [yarn](https://yarnpkg.com/getting-started/install) >=3.x.x

### Install

To set up the development environment, follow these steps:

1. Install the latest LTS version of [Node.js](https://nodejs.org/en/).

2. Enable [Corepack](https://github.com/nodejs/corepack#how-to-install) at the root of the project:

```shell
corepack enable
```
3. Install dependencies:

```shell
yarn install
```
4. Build Ocelloids libraries:

```shell
yarn build
```

### Project Layout

The Ocelloids repository utilizes workspaces for modularization and organization.

The repository contains two main folders: `packages`, `examples` and `tools`.

#### Packages

The `packages` folder contains the Ocelloids SDK implementation, which is further divided into core, test, and pallets modules.

### Core

Here is the high-level structure of the `packages/core` module source folder:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
|  apis                        | Multi-chain APIs                          |
|  configuration               | Configuration                             |
|  converters                  | Chain data type conversions               |
|  observables                 | Reactive emitters                         |
|  operators                   | Reactive operators                        |
|  subjects                    | Reactive subjects                         |
|  types                       | Extended types                            |

The core module is published as the `@sodazone/ocelloids` package.

### Pallets

The `packages/pallets` folder includes a module for each supported pallet:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
|  contracts                   | Contracts pallet support                  |

The pallet modules are published following the naming convention `@sodazone/ocelloids-<pallet name>`.

### Test Support

The `packages/test` module includes network captured test data and mocks.

#### Tools

The development support tools include functionalities such as chain data capture to assist in the development of the SDK.

#### Examples

The [examples/](https://github.com/sodazone/ocelloids/tree/main/examples) folder contains example applications.

### Troubleshooting

#### Visual Studio Code

If you encounter the issue of `@sodazone/ocelloids-test` being marked as unresolved 
in the `spec` test files after building the project, you can resolve it by following these steps:

* Open any typescript file of the project.
* Run the command "TypeScript: Reload project" to reload the TypeScript project configuration.

For further assistance or troubleshooting, please consult the project's documentation or reach out to the Ocelloids community.

