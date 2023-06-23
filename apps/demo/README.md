# Demo Applications

The demo applications have shebangs to be executed with [ts-node-esm](https://typestrong.org/ts-node/) or using [bun](https://bun.sh) to execute the npm bins.

## XT Watch

`xtwatch` is a demo application that allows you to filter out extrinsics from Substrate networks.
It utilizes the [mongo query language](https://www.mongodb.com/docs/manual/tutorial/query-documents/) filters, defined using [hjson](https://github.com/hjson).
You can find examples of filters in the [filters/](./filters/) directory.
The application expects the filter to be provided in stdin.

### Usage

To execute `xtwatch`, navigate to the `ocelloids/apps` folder.

Get timestamp extrinsics from Polkadot and Kusama:
```shell
❯ ./demo/xtwatch.ts -v -u wss://rpc.polkadot.io -u wss://kusama-rpc.polkadot.io < demo/filters/timestamp.hjson
```
<details>
<summary>output - click to expand</summary>

```
> Endpoints: [ 'wss://rpc.polkadot.io', 'wss://kusama-rpc.polkadot.io' ]
> Using filter: {
  "call.section": "timestamp"
}
{"network":0,"extrinsicId":"16091931-0","blockNumber":"16,091,931","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,472,000"},"method":"set","section":"timestamp"}}
{"network":1,"extrinsicId":"18481136-0","blockNumber":"18,481,136","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,472,000"},"method":"set","section":"timestamp"}}
{"network":1,"extrinsicId":"18481137-0","blockNumber":"18,481,137","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,478,000"},"method":"set","section":"timestamp"}}
{"network":0,"extrinsicId":"16091932-0","blockNumber":"16,091,932","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,478,001"},"method":"set","section":"timestamp"}}
{"network":1,"extrinsicId":"18481138-0","blockNumber":"18,481,138","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,484,000"},"method":"set","section":"timestamp"}}
{"network":0,"extrinsicId":"16091933-0","blockNumber":"16,091,933","position":0,"isSigned":false,"method":{"args":{"now":"1,687,514,484,001"},"method":"set","section":"timestamp"}}
```
</details>

Get balances extrinsics and pipe to jq:

```shell
❯ bunx xtwatch < demo/filters/balances.hjson | jq .
```
<details>
<summary>output - click to expand</summary>

```
{
  "network": 0,
  "extrinsicId": "16091979-2",
  "blockNumber": "16,091,979",
  "position": 2,
  "isSigned": true,
  "method": {
    "args": {
      "dest": {
        "Id": "1NZDpVCCVvpJDMgwktmD5skfKvaPpHMWJ8sSzxmtD6jQ7wC"
      },
      "value": "8,000,000,000,000"
    },
    "method": "transferKeepAlive",
    "section": "balances"
  },
  "era": {
    "MortalEra": {
      "period": "64",
      "phase": "6"
    }
  },
  "nonce": "196",
  "signature": "0xaa861acfedadbce2344016f0f2b19a9059d434cd10a5d81d7cea282eaca5cf5831d53838b9149797d511b601609b6856b658566ceae9a7f6c2b49b6a0046228f",
  "signer": {
    "Id": "16SjNu775Bo3obUFzBCph7zYB8eYiRwH9LNzfyTucq4J2vbk"
  },
  "tip": "0"
}
{
  "network": 0,
  "extrinsicId": "16091981-2",
  "blockNumber": "16,091,981",
  "position": 2,
  "isSigned": true,
  "method": {
    "args": {
      "dest": {
        "Id": "15e9GEhrbmTJeBw8PQypexhvyMpkhB42D67HBW7AU6mXP6xX"
      },
      "value": "611,739,634,000"
    },
    "method": "transferAllowDeath",
    "section": "balances"
  },
  "era": {
    "MortalEra": {
      "period": "64",
      "phase": "8"
    }
  },
  "nonce": "314,589",
  "signature": "0x2608d6fbfb05b3f540d5b42be5ea68247d36060a24304342205c2d27a9ecf2e98ea7cc6c13b1fb172571b201e3d27d6a9cacf662a7f447338ee77661e55c290f",
  "signer": {
    "Id": "1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7"
  },
  "tip": "0"
}
...omitted
```
</details>

