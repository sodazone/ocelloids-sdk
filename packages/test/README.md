# Ocelloids Test Module

The Ocelloids SDK Test Module provides real network data captured using the Ocelloids [Capture Tool](https://github.com/sodazone/ocelloids-sdk/tree/main/tools) for unit testing purposes. It also includes Jest mocks that are necessary for testing.

## Layout

The `packages/test` module source folder is structured as follows:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
|  \_\_data\_\_                | Raw data to be used for mocks and tests   |
|  mocks                       | Jest mocks                                |

## Usage

### Using Available Test Data and Mocks

You can leverage the test data and mocks provided by the `ocelloids-sdk-test` module for your Jest tests. Here's an example:

```typescript
import { testBlocks, mockRxApi } from '@sodazone/ocelloids-sdk-test';

it('should emit the latest new block', done => {
  const testPipe = blocks()(mockRxApi);
  const o = {
    next: jest.fn(),
    complete: jest.fn().mockImplementation(() => {
      done();
    })
  };
  testPipe.subscribe(o);

  expect(o.next).toHaveBeenCalledTimes(testBlocks.length);
  expect(o.complete).toHaveBeenCalledTimes(1);
});
```

The currently available data can be found in the following files:

- `./_blocks.ts` : Provides blocks, events and extrinsics data captured on Polkadot. It also includes `utility.Batch` extrinsics.
- `./_contracts.ts` : Provides blocks, events, and extrinsics data captured on Rococo Contracts, including contract instantiation, calls, emitted events, contract metadata, and contract addresses.
- `./mocks/` : Provides Jest mocks for PolkadotJS promise and RX API.

### Using Custom Captured Data

If you have captured data from your chain using the Ocelloids capture tool, you can move the CBOR binary file to `__data__/` directory. Then, you can use the `testBlocksFrom` function to transform the binary data into `SignedBlockExtended` objects.

If the captured data is not from Polkadot, you will need to provide the chain metadata to the `testBlocksFrom` function. An example of this can be seen in `./_contracts.ts`, where the metadata for Rococo Contracts is used:

```typescript
import metadataStatic from './__data__/metadata/rococoContracts-hex.js';

import { testBlocksFrom } from './_blocks.js';

export const testContractBlocks = testBlocksFrom('contracts2841323.cbor.bin', metadataStatic);
```

To obtain the chain metadata, you can use the `state_getMetadata` RPC call.