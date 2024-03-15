# Ocelloids Contracts Module

<a href="https://www.npmjs.com/package/@sodazone/ocelloids-sdk-contracts">
  <img 
    src="https://img.shields.io/npm/v/@sodazone/ocelloids-sdk-contracts?color=69D2E7&labelColor=69D2E7&logo=npm&logoColor=333333"
    alt="npm @sodazone/ocelloids-sdk-contracts"
  />
</a>

The Ocelloids Contracts Module provides support for Substrate's contracts pallet, specifically for decoding contract messages, events, and constructors, and enables easy filtering of these elements. It is designed to be used in conjunction with the Ocelloids Core Module.

## Layout

The `packages/pallets/contracts` module source folder is structured as follows:

| Directory                    | Description                                |
|------------------------------|--------------------------------------------|
|  converters                  | Contract data type conversions             |
|  operators                   | Reactive operators for contract activities |
|  types                       | Extended contract types                    |

## Usage

Refer to the [SDK documentation](https://sodazone.github.io/ocelloids-sdk/).

### Example: Tracking Contract Events

Here is a simple example of how to track all events emitted by the [link](https://github.com/paritytech/link) contract deployed on Rococo Contracts:

```typescript
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocks
} from '@sodazone/ocelloids-sdk';

import {
  filterContractEvents,
  converters
} from '@sodazone/ocelloids-sdk-contracts';

const CONTRACT_ADDRESS = '5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3';

const contractMetadataJson = readFileSync((path.resolve(__dirname, './metadata.json'))).toString();
const abi = new Abi(contractMetadataJson);

const apis = new SubstrateApis({
  rococoContracts: {
    provider: new WsProvider('wss://rococo-contracts-rpc.polkadot.io')
  }
});

apis.rx.rococoContracts.pipe(
  blocks(),
  filterContractEvents(abi, CONTRACT_ADDRESS)
).subscribe(
  x => console.log({
    ...converters.contracts.toNamedPrimitive(x),
    blockEvent: x.blockEvent.toHuman()
  })
);
```

Output:

```javascript
{
  blockEvent: {
    eventId: '2920834-2-1',
    extrinsicId: '2920834-2',
    extrinsicPosition: 1,
    blockNumber: '2,920,834',
    method: 'ContractEmitted',
    section: 'contracts',
    index: '0x2803',
    data: {
      contract: '5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3',
      data: '0x00144a736d48325868747470733a2f2f6d79666162756c6f75732e75726c'
    }
  },
  event: {
    docs: [ ' A new slug mapping was created.' ],
    identifier: 'Shortened',
    index: 0
  },
  args: { slug: 'JsmH2', url: 'https://myfabulous.url' }
}
```

For more detailed examples, please refer to the [watch-contracts](https://github.com/sodazone/ocelloids-sdk/tree/main/examples/watch-contracts) example application.

