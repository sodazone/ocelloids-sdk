# Development Support Tools

## Capture

The capture tool is a command line tool that allows you to download blocks from a network, enhance them as extended signed blocks, and output a CBOR representation.

This tool is useful for capturing blockchain data to be used in tests.

To use the capture tool, run the following command:

```shell
./capture.ts ./out.cbor --start="2841323" --count="20" --url="wss://rococo-contracts-rpc.polkadot.io"
```
In the above example, it downloads 20 blocks from the Rococo Contracts network and saves the enhanced blocks in the `out.cbor` file.

## Cdump

The cdump tool is a command line tool used to inspect the named primitive serialization outputs, i.e. the format of Ocelloids `convert`.

To use the cdump tool, run the following command:

```shell
bun cdump -u wss://rococo-contracts-rpc.polkadot.io | jq .
```

<details>
<summary>output - click to expand</summary>

> Some output has been skipped for brevity.

```json
{
  "extrinsic": {
    "hash": "0xd9e54c3631456638e90d1703d3a4a9a42914569b9846e1cd342a2f21d217d432",
    "era": {
      "ImmortalEra": "0x00"
    },
    "nonce": 0,
    "tip": 0,
    "signature": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "signer": {
      "id": "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM"
    },
    "isSigned": false,
    "isEmpty": false,
    "call": {
      "method": "set",
      "section": "timestamp",
      "args": {
        "now": 1688045574092
      }
    }
  },
  "events": [
    {
      "section": "system",
      "method": "ExtrinsicSuccess",
      "data": {
        "dispatchInfo": {
          "weight": {
            "refTime": 286099000,
            "proofSize": 1493
          },
          "class": "Mandatory",
          "paysFee": "Yes"
        }
      }
    }
  ]
}
```
</details>

