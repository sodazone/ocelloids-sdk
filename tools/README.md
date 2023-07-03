# Development Support Tools

The Ocelloids SDK tools are a collection of command-line tools designed to streamline the development process.

## Prerequisites

Before using the tools, make sure you have installed and built the root project.

1. Build the tools package:

```shell
yarn build:tools
```

2. Navigate to the tools folder:

```shell
cd tools
```

3. Run the following command to see the available options:

```
yarn octools -h
```

## Tools

### Capture

The capture tool is a command-line utility that enables you to download blocks from a network, enhance them as extended signed blocks, and save them in a CBOR representation.

This tool is particularly useful for capturing blockchain data to be used in tests.

To use the capture tool, execute the following command:

```shell
yarn octools capture ./out.cbor --start="2841323" --count="20" --url="wss://rococo-contracts-rpc.polkadot.io"
```

In the above example, it downloads 20 blocks from the Rococo Contracts network and saves the enhanced blocks in the `out.cbor` file.
