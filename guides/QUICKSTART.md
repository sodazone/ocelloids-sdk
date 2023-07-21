# Ocelloids SDK Quickstart

This quickstart document will guide you through the installation and setup of your first monitoring program with the Ocelloids SDK. We'll provide examples and explain essential SDK concepts along the way.

The Ocelloids SDK leverages [RxJS](https://rxjs.dev/) in conjunction with the Rx API of Polkadot.js, so some familiarity with ReactiveX observable streams will be beneficial.

## Prerequisites

Please, make sure that you have the following software installed:
* [Node.js](https://nodejs.org/en/) >=18.14

## Create a New Project

Follow these simple steps to create a new TypeScript project with the required dependencies.

Create a new directory for your project and change directory to it:

```shell
mkdir my-monitor && cd my-monitor
```

Initialize a new npm project with default settings:

```shell
npm init -y && npm pkg set type="module"
```

Install TypeScript and [ts-node](https://typestrong.org/ts-node/) for direct TypeScript execution:

```shell
npm i -D typescript ts-node
```

Generate a TypeScript configuration file:

```shell
npx tsc --init --module nodenext --outDir ./out --skipLibCheck true --sourceMap true
```

Install the core package of the SDK:

```shell
npm i @sodazone/ocelloids
```

If you require specific pallet support, install the corresponding package. For `pallet-contracts` support:

```shell
npm i @sodazone/ocelloids-contracts
```

Create an `index.ts` file as the entrypoint for your monitor:

```shell
cat <<EOF > index.ts
import { SubstrateApis, blocks } from '@sodazone/ocelloids';
import { WsProvider } from '@polkadot/api';

// 1. Initialise Polkadot.js APIs
// for Polkadot network
const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider(
      'wss://rpc.polkadot.io'
    )
  }
});


// 2. Pipe Rx API to the blocks observable
// and subscribe to it, logging the output
apis.rx.polkadot.pipe(
  blocks()
).subscribe(
  b => console.log(b.toHuman());
);
EOF
```

> This straightforward example that subscribes to new blocks and logs them to the console.

Finally, execute the following command to run your monitor:

```shell
npx ts-node --esm index.ts
```

## Adding More Functionality

Congratulations on having your basic monitor up and running! Now, let's enhance it with some ✨ awesome ✨ features.

### Filtering over Streams

The [`mongoFilter` operator](https://sodazone.github.io/ocelloids/functions/_sodazone_ocelloids.mongoFilter.html) allows you to filter data and receive alerts only for specific blocks. This operator applies a MongoDB query language filter to the incoming observable stream, processing it in memory.

For example, to monitor blocks validated by certain validators:

```typescript
// imports and initialise APIS...

apis.rx.polkadot.pipe(
  blocks(),
  mongoFilter({
    'author': {
      $in: [
        '1zugcapKRuHy2C1PceJxTvXWiq6FHEDm2xa5XSU7KYP3rJE', // ZUG CAP
        '1zugcaaABVRXtyepKmwNR4g5iH2NtTNVBz1McZ81p91uAm8', // ZUG CAP 2
        '1zugcaebzKgKLebGSQvtxpmPGCZLFoEVu6AfqwD7W5ZKQZt', // ZUG CAP 4
        '1zugcabTuN7rs1bFYb33gRemtg67i4Mvp1twW85nQKiwhwQ', // ZUG CAP 5
        '1zugcaj4mBMu7EULN4rafT5UTfBjbvqaoypZyxWa3io6qJS', // ZUG CAP 7
        '1zugcajKZ8XwjWvC5QZWcrpjfnjZZ9FfxRB9f5Hy6GdXBpZ'  // ZUG CAP 8
      ]
    }
  })
).subscribe(
  b => console.log(b.toHuman());
);
```

To filter for blocks that contain more than two extrinsics:

```typescript
// imports and initialise APIS...

apis.rx.polkadot.pipe(
  blocks(),
  mongoFilter({
    'extrinsics.2': { $exists: true }
  })
).subscribe(
  b => console.log(b.toHuman());
);
```

#### How to know which data to filter?

Whilst the main parts of the types passed through the reactive pipelines are well-known and play well with intellisense, the data parts to filter requires knowledge in advance. Here are some ways to help you:

1. Use DEBUG=oc-ops-mongo-filter.

```shell
DEBUG=oc-ops-mongo-filter npx ts-node --esm main.ts
```

2. Use the convert operator:

```typescript
// imports and initialise APIS...

apis.rx.polkadot.pipe(
  blocks(),
  // convert to named primitive representation that is used for filtering
  convert(),
  // tap to log to console the output
  tap(block => console.log(JSON.stringify(block))),
  // other operators...
).subscribe(
  b => console.log(b.toHuman());
);
```

3. Use a debugger:

For more details, check our guide on [debugging](https://github.com/sodazone/ocelloids/blob/main/guides/DEBUGGING.md)

### Using Operators

The Ocelloids SDK provides a set of useful [operators](https://sodazone.github.io/ocelloids/modules/_sodazone_ocelloids.html) hat can be applied to observables to retrieve specific data. One such operator is `mongoFilter`, explained in the previous section. Other operators like [`filterExtrinsics`](https://sodazone.github.io/ocelloids/functions/_sodazone_ocelloids.filterExtrinsics.html) and [`filterEvents`](https://sodazone.github.io/ocelloids/functions/_sodazone_ocelloids.filterEvents.html) abstract commonly used patternss. 

For example, `filterExtrinsics` takes a `SignedBlockExtended` observable as input, extracts extrinsics with events, flattens batched extrinsics, and applies a filter to the results. You can use it to filter successful balance transfer extrinsics:

```typescript
// imports and initialises APIs

apis.rx.polkadot.pipe(
  blocks(),
  filterExtrinsics({
    'dispatchError': { $exists: false },
    'extrinsic.call.section': 'balances',
    'extrinsic.call.method': { $in: [
      'transfer',
      'transferAllowDeath',
      'transferKeepAlive'
    ]
  }
  })
).subscribe(
  b => console.log(b.extrinsic.toHuman());
);
```

Another operator, `filterEvents`, uses `filterExtrinsics` internally and accepts filtering criteria for both extrinsics and events. You can use it to filter for balance transfer events on only successful extrinsics:

```typescript
// imports and initialises APIs

apis.rx.polkadot.pipe(
  blocks(),
  filterEvents(
    // Filter criteria over events
    {
      section: 'balances',
      method: 'Transfer'
    },
    // Filter criteria over extrinsics
    // The criteria shown here is the default, included only for demonstration purposes.
    // You can add other criteria for extrinsics, like the signer, method, section, etc.
    {
      dispatchError: { $exists: false }
    }
  )
).subscribe(
  b => console.log(b.toHuman());
);
```

Remember that since the Ocelloids SDK is based on RxJS, you can use the powerful RxJS library to its full potential.

For instance, to calculate the time between two `timestamp.set` extrinsics, you can use the `bufferCount` operator:

```typescript
import { bufferCount, map } from 'rxjs';

// initialise APIS...

// Buffer 2 `timestamp.set` extrinsics and compute the difference between the two timestamps to get the block time
apis.rx.polkadot.pipe(
  blocks(),
  filterExtrinsics({
    'extrinsic.call.section': 'timestamp',
    'extrinsic.call.method': 'set'
  }),
  map(
    ({ extrinsic: { args } }) => args[0].toPrimitive() as number
  ),
  bufferCount(2, 1)
).subscribe(([prev, curr]) => {
  console.log(`Block time: ${curr - prev}ms`);
});
```

### Pallet Contracts Support

The Ocelloids SDK provides separate packages for Substrate pallet support, keeping the core package lightweight and enabling users to install only the necessary packages.

To use the `pallet-contracts` package, simply install it with npm:

```shell
npm i @sodazone/ocelloids-contracts
```

The package offers convenient operators for handling contract calls, events, and constructors, automatically decoding ABI. You can filter over decoded data using the [`filterContractCalls`](https://sodazone.github.io/ocelloids/functions/_sodazone_ocelloids_contracts.filterContractCalls.html) operator, for example:

```typescript
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SubstrateApis, blocks } from '@sodazone/ocelloids';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';
import { filterContractCalls } from '@sodazone/ocelloids-contracts';

// 1. Initialise Polkadot.js APIs
const apis = new SubstrateApis({
  rococo: {
    provider: new WsProvider(
      'wss://rococo-contracts-rpc.polkadot.io'
    )
  }
});

// 2. Initialise contract ABI
// This example uses the erc20 contract in the `ink-examples` repo
const contractMetadataJson = readFileSync((path.resolve(process.cwd(), 'erc20.json'))).toString();
const abi = new Abi(contractMetadataJson);

// 3. Construct filtered contract call observable
// and subscribe to it, logging the output
apis.rx.rococo.pipe(
  blocks(),
  filterContractCalls(
    abi,
    // contract address
    '5Ee73nVsD1pLQEGkT4TfRQBR6cs7s4vnXWVAc2pCH8gZW12r',
    // filter criteria over contract calls
    // matching only 'transfer' calls with value over 100_000_000_000_000
    {
      'message.identifier': 'transfer',
      'args.value': { $bn_gt: 100_000_000_000_000 }
    }
  )
).subscribe(
  x => {
    console.log(x.message.identifier);
    console.log(x.args.map(a => a.toHuman()));
  }
);
```

### Backtesting

You might want to ensure that your filter works correctly before running your monitor with real-time data. To test your filter, you can use the [`blocksInRange`](https://sodazone.github.io/ocelloids/functions/_sodazone_ocelloids.blocksInRange.html) observable to scan a range of historical blocks where you are certain your filter should match and validate the output.

For example, to test a filter monitoring staking rewards paid out to your account, you can use the following program:

```typescript
// imports and initialise APIs

apis.rx.polkadot.pipe(
  // scans 5 blocks starting from 16498216
  blocksInRange(16498216, 5),
  filterEvents({
    'section': 'staking',
    'method': 'Rewarded',
    'data.stash': '12sNWzUSLYegKtGRKCuCmd23RSKi8zZwdcKqPxFKEqhTqm5X'
  })
).subscribe((ev) => {
  console.log(ev.toHuman())
})
```

You should see the following output in your console:

```shell
{
  eventId: '16498216-4-8',
  extrinsicId: '16498216-4',
  extrinsicPosition: 8,
  blockNumber: '16,498,216',
  method: 'Rewarded',
  section: 'staking',
  index: '0x0701',
  data: {
    stash: '12sNWzUSLYegKtGRKCuCmd23RSKi8zZwdcKqPxFKEqhTqm5X',
    amount: '347,690,548,083'
  }
}
```

By following these instructions and examples, you can now expand your monitoring program with additional features and take full advantage of the Ocelloids SDK capabilities.

Enjoy! 🦐✨