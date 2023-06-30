# Development Support Tools

## Capture

The capture tool is a command line tool that allows you to download blocks from a network, enhance them as extended signed blocks, and output a CBOR representation.

This tool is useful for capturing blockchain data to be used in tests.

To use the capture tool, run the following command:

```shell
./capture.ts ./out.cbor --start="2841323" --count="20" --url="wss://rococo-contracts-rpc.polkadot.io"
```
In the above example, it downloads 20 blocks from the Rococo Contracts network and saves the enhanced blocks in the `out.cbor` file.
