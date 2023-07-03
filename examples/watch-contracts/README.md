# Watch Contract Messages

This is a demo application that allows you to watch contract messages of a specific contract deployed on a Substrate network.

The main monitoring logic of the application can be found in `watcher.ts`.

## Configuration

To configure the application, create a `config.hjson` file with the following structure:

```javascript
{
  // Contract address.
  address: '5HfQopC1yQSoG83auWgRLTxhWWFxiVQWT74LLXeXMLJDFBvP'
  // Path to contract metadata file.
  // The path can be absolute or relative to this config file.
  metadata: my_contract.json
  // Network WS endpoint where the contract is deployed.
  network: 'ws://127.0.0.1:9944'
  // Blocks in range toggle.
  // If set to true, the application will scan past blocks starting from `startBlock`.
  // If set to false, the application will only watch new blocks.
  getBlocksInRange: true
  // Starting block to scan (required if `getBlocksInRange` is `true`).
  startBlock: 34870110
  // Number of blocks to scan (required if `getBlocksInRange` is `true`).
  range: 30
  // Filter criteria for an extrinsic and its events.
  // This filter is applied before decoding the contract message.
  // The default value filters for successful extrinsics only.
  // (Optional)
  extrinsicsCriteria: {
    extrinsic.signer: '5HprbfKUFdN4qfweVbgRtqDPHfNtoi8NoWPE45e5bD5AEKiR'
  }
  // Filter criteria for decoded contract messages.
  // (Optional)
  callsCriteria: {
    message.identifier: register
  }
  // Path to custom type definitions.
  // The path can be absolute or relative to this config file.
  // (Optional)
  customTypes: my_custom_types.ts
}
```

## Usage

From anywhere within the `ocelloids/examples/` directory, execute the following command:

```shell
❯ yarn watch-contracts [options]
```

### Options:
`-p, --path <configPath>` Path to the configuration file for the contract to watch.

`-v, --verbose` (optional) Enables verbose logging.

### Example

```shell
❯ yarn watch-contracts -v -p ./config.hjson
```

Alternatively, if you want to execute Typescript directly, you can use [ts-node-esm](https://github.com/TypeStrong/ts-node).

Example running from the `/ocelloids/examples/` directory:

```shell
❯ ./watch-contracts/main.ts -v -p ./config.hjson
```

Or with [Bun](https://bun.sh/):

```shell
❯ bun watch-contracts -v -p ./config.hjson
```

## Example Contracts

We have provided a few showcase contracts deployed on public test networks as examples. Configuration files, contract metadata, and, if applicable, custom type files for these contracts can be found in the `./contracts/` directory.

To run any of the examples, simply specify the path to the configuration file:

```shell
❯ yarn watch-contracts -v -p ./contracts/<contract>/config.hjson
```

### [Link](https://github.com/paritytech/link)

This is a showcase dApp created by the ink! team at Parity. It is a URL shortener that allows users to store a shortened version of a URL, which can be resolved back to the long version. It is deployed on Rococo Contracts.

### [AZERO.ID](https://azero.id/)

This contract serves as the main registry for .tzero domains, which is the testnet version of AZERO.ID. It enables users to register, transfer, and claim their preferred domain names. The contract is deployed on the Aleph Zero Testnet.

### [Magink](https://github.com/swanky-dapps/magink-dapp)
Magink is an example dApp created by the Swanky team of Astar. It offers an immersive experience where users can earn badges for completing lessons and unlock an exclusive Wizard NFT upon conquering all ten lessons. The contract is deployed on Shibuya.

