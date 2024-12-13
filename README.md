> [!IMPORTANT]
> Due to the ongoing [Polkadot JS API](https://github.com/polkadot-js/api) deprecation, which is currently in maintenance-only mode, the Polkadot JS SDK project has been archived and is no longer maintained.

<div align="center">

<h1>Polkadot JS SDK</h1>

[Packages](https://github.com/sodazone/pjs-sdk/#installation) | [Documentation](https://sodazone.github.io/pjs-sdk/) | [Examples](https://github.com/sodazone/pjs-sdk/tree/main/examples)

<p align="center">
  <a href="https://github.com/sodazone/pjs-sdk/actions/workflows/ci.yml"><img
      src="https://img.shields.io/github/actions/workflow/status/sodazone/pjs-sdk/ci.yml?branch=main&color=69D2E7&labelColor=A7DBD8"
      alt="CI"
    /></a>
  <a href="https://github.com/sodazone/pjs-sdk/blob/main/LICENSE"><img
      src="https://img.shields.io/github/license/sodazone/pjs-sdk?color=69D2E7&labelColor=A7DBD8"
      alt="License"
    /></a>
</p>
</div>

---

Polkadot JS SDK is an open-source software development kit written in Typescript for Polkadot and Substrate based networks.
It simplifies the implementation of multi-chain programs and provides domain-specific logic for different pallets.

## Features

* **Composable Reactive Streams** — Easily filter blockchain data and react to occurrences of interest using composable reactive streams.
* **Data Sources** — Retrieve data from extrinsics, blocks, events and storage.
* **Powerful Query Operators** — Filter data using integrated operators that support complex queries in the Mongo query language. Includes support for big numbers and advanced features such as dynamic queries.
* **Flexible Type Conversions** — Seamlessly convert data into a terse queryable format.
* **Extended Context Types** — Extend base generic events and extrinsics with contextual information such as block number, block position and extrinsic position.
* **Nested Calls Extraction** — Supports recursive flattening with event correlation of nested utility (i.e. batch calls), multisig and proxy calls within an extrinsic.
* **Multi-Chain Support** — Interact with multiple networks.
* **Pallet-Specific Modules** — Modules designed to handle use cases related to a particular pallet, such as tracking calls and events from the contracts pallet.


## Quickstart

Check our [Quickstart Guide](https://github.com/sodazone/pjs-sdk/blob/main/guides/QUICKSTART.md) to set up your first program.

## Installation

### PJS Core SDK

<a href="https://www.npmjs.com/package/@sodazone/pjs-sdk">
  <img 
    src="https://img.shields.io/npm/v/@sodazone/pjs-sdk?color=69D2E7&labelColor=69D2E7&logo=npm&logoColor=333333"
    alt="npm @sodazone/pjs-sdk"
  />
</a>

```shell
npm i @sodazone/pjs-sdk
```

Provides essential abstractions, reactive operators, base type converters, and pallet-independent functionality.

Source code [packages/core](https://github.com/sodazone/pjs-sdk/tree/main/packages/core).

### PJS Contracts SDK

<a href="https://www.npmjs.com/package/@sodazone/pjs-sdk-contracts">
  <img 
    src="https://img.shields.io/npm/v/@sodazone/pjs-sdk-contracts?color=69D2E7&labelColor=69D2E7&logo=npm&logoColor=333333"
    alt="npm @sodazone/pjs-sdk-contracts"
  />
</a>

```shell
npm i @sodazone/pjs-sdk-contracts
```

Provides operators and type converters for the contracts pallet.

Source code [packages/pallets/contracts](https://github.com/sodazone/pjs-sdk/tree/main/packages/pallets/contracts).

## Usage

Refer to the [SDK documentation](https://sodazone.github.io/pjs-sdk/).

You can also explore some example applications in the [examples/](https://github.com/sodazone/pjs-sdk/tree/main/examples) folder.

### Example: Filtering Transfer Events

Here's a basic usage example that filters balance transfer events from finalized blocks above a certain amount:

```typescript
import { WsProvider } from '@polkadot/api';

import {
  SubstrateApis,
  finalizedBlocks,
  filterEvents
} from '@sodazone/pjs-sdk';

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

<details>
<summary>Extended event output - click to expand</summary>

Extended event output with contextual information:

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
</details>

The event identifier `eventId` consists of the block number, the position of the extrinsic within the block,
and the position of the event within the extrinsic.

<details>
<summary>Filter events operator details - click to expand</summary>

The `filterEvents` operator used in the example is composed of the following stack:

```typescript
source.pipe(
  // Extracts extrinsics with events
  extractTxWithEvents(),
  
  // Flattens and correlates events for nested 
  // batch, multisig, proxy and derivative calls
  flattenCalls(),
  
  // Filters at the extrinsic level
  // mainly for success or failure
  mongoFilter(extrinsicsCriteria),
  
  // Maps the events with
  // block and extrinsic context
  extractEventsWithTx(),
  
  // Filters over the events
  mongoFilter(eventsQuery),
  
  // Share multicast
  share()
)
```

</details>

### Example: Account Balance

Here's an example that monitors the balance of an account with an amount threshold condition:

```typescript
import { WsProvider } from '@polkadot/api';
import { switchMap } from 'rxjs';

import {
  SubstrateApis,
  mongoFilter
} from '@sodazone/pjs-sdk';

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider('wss://rpc.polkadot.io')
  }
});

apis.query.polkadot.pipe(
  switchMap(q => q.system.account(
    '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5'
  )),
  mongoFilter({
    'data.free': { $bn_lt: '6038009840776279' }
  })
).subscribe(x => console.log('Account Balance:', x.toHuman()));
```

### Example: Dynamic Query

Now, let's explore a dynamic query example that collects and monitors balance transfer events for a set of addresses, starting from ALICE's address:

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
} from '@sodazone/pjs-sdk';

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

This example introduces the concept of a dynamic query. As new addresses are encountered, the dynamic query is updated with the newly seen addresses by calling `dynamicQuery.change()`. This ensures that future events will be filtered based on the updated set of addresses.

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

The Ocelloids repository utilizes workspaces for modularization.

The repository contains three main folders: `packages`, `examples` and `tools`.

#### Packages

The `packages` folder contains the Ocelloids SDK implementation, which is further divided into `core`, `pallets`, and `test` modules.

#### Tools

The development support tools include functionalities such as chain data capture to assist in the development of the SDK.

#### Examples

The [examples/](https://github.com/sodazone/pjs-sdk/tree/main/examples) folder contains example applications.

### Testing

To run unit tests, use the following command:

```shell
yarn test
```

Additional test data and mocks are available in `packages/test/` for your convenience. If necessary, you can capture specific data using the development support tools located in `tools/` for testing purposes.

### Troubleshooting

#### Visual Studio Code

If you encounter the issue of `@sodazone/pjs-sdk-test` being marked as unresolved 
in the `spec` test files after building the project, you can resolve it by following these steps:

* Open any typescript file of the project.
* Run the command "TypeScript: Reload project" to reload the TypeScript project configuration.

For further assistance or troubleshooting, please consult the project's documentation or reach out to the Ocelloids community.

[^1]: Noun ocelloid (_plural_ ocelloids): “(microbiology) a cellular structure found in unicellular microorganisms that is analogous in structure and function to eyes, which focus, process and detect light.”
 
