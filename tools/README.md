# Development Support Tools

**capture**

Command line tool to download blocks from a network, enhance them as extended signed blocks and output a CBOR representation.

Example to download 20 blocks from rococo contracts network.
```
./capture.ts ./out.cbor --start="2841323" --count="20" --endpoint="wss://rococo-contracts-rpc.polkadot.io"
```

**cdump**: command line tool to inspect the named primitive serialization outputs.

