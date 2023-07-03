# Ocelloids SDK Examples

The Ocelloids SDK Examples provide demonstrations of various functionalities offered by Ocelloids.
They serve as a reference for integrating Ocelloids into your own projects.

## Running the Examples

Before running the examples, ensure that you have already installed and built the root project.

1. Build the examples package:

```shell
yarn build:examples
```

2. Navigate to the examples folder:

```shell
cd examples
```

3. Run the desired example by executing the corresponding binary, use the following command:

```shell
yarn <binary_name>
```

Here are the available binaries to run the example applications:

* filter-extrinsics: Filters extrinsics using HJSON provided filters. Supports pipeable stdin and stdout.
* filter-fee-events: Filters balances fee-related events. Supports pipeable stdout.
* follow-transfer-events: Simple demonstration of dynamic queries.
* light-client: Demonstrates the usage of the Smoldot light client provider.
* watch-contracts: Filters contract messages. Supports pipeable stdout.
* watch-transfer-events: Watches transfers above a specified amount. Supports pipeable stdout.

For example, to run the `filter-fee-events` application, use the following command:

```shell
yarn filter-fee-events
```

<details>
<summary>output - click to expand</summary>

> Some output has been skipped for brevity.

```javascript
{
  eventId: '16134446-2-0',
  extrinsicId: '16134446-2',
  extrinsicPosition: 0,
  blockNumber: '16,134,446',
  method: 'Withdraw',
  section: 'balances',
  index: '0x0508',
  data: {
    who: '12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW',
    amount: '161,430,964'
  }
}
{
  eventId: '16134446-2-4',
  extrinsicId: '16134446-2',
  extrinsicPosition: 4,
  blockNumber: '16,134,446',
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
    amount: '129,144,771'
  }
}
{
  eventId: '16134446-2-6',
  extrinsicId: '16134446-2',
  extrinsicPosition: 6,
  blockNumber: '16,134,446',
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '12YVhYTtGpTCSXRvPHyNjDK7y5p4J52ppBVJGjWh2PGrUe9r',
    amount: '32,286,193'
  }
}
```
</details>

These examples serve as practical illustrations of how to utilize the Ocelloids SDK and can be customized to fit your specific use cases.

If you prefer to run TypeScript `main.ts` files directly, either for development or quick testing without the need for building,
you have the option to use either [ts-node-esm](https://github.com/TypeStrong/ts-node) or [Bun](https://bun.sh/).
