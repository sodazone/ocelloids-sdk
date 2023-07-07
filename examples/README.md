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

* __filter-extrinsics__: Filters extrinsics using HJSON provided filters. Supports pipeable stdin and stdout.
* __follow-transfer-events__: Simple demonstration of dynamic queries.
* __light-client__: Demonstrates the usage of the Smoldot light client provider.
* __simple-fees__: Calculates simple fee stats for a block range.
* __watch-balances__: Watches the change in balances of big exchange hot wallets from chain storage.
* __watch-contracts__: Watches for contract messages of a specific contract and filters based on configured criteria. Supports pipeable stdout.
* __watch-instantiations__: Watches contract instantiations of the same code hash.
* __watch-transfer-events__: Watches transfers above a specified amount. Supports pipeable stdout.

For example, to run the `simple-fees` application, use the following command:

```shell
yarn simple-fees
```

<details>
<summary>output - click to expand</summary>

```
Fees [16134439-16134539]
========================================
Average: 15.9970 mDOT
Minimum: 11.9089 mDOT (@16134496-2)
Maximum: 29.0940 mDOT (@16134517-2)
----------------------------------------
Time: 4415ms (44.15 block/s)
Blocks: 100 (tx: 364, events: 4931)
```
</details>

These examples serve as practical illustrations of how to utilize the Ocelloids SDK and can be customized to fit your specific use cases.

If you prefer to run TypeScript `main.ts` files directly, either for development or quick testing without the need for building,
you have the option to use either [ts-node-esm](https://github.com/TypeStrong/ts-node) or [Bun](https://bun.sh/).
