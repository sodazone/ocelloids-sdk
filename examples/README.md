# Ocelloids SDK Examples

The Ocelloids SDK Examples provide demonstrations of various functionalities offered by Ocelloids.
They serve as a reference for integrating Ocelloids into your own projects and as a test bench.

## Running the Examples

1. From the root directory ensure that you have already installed and built the project:

```shell
yarn && yarn build
```

2. Build the examples package:

```shell
yarn build:examples
```

3. Navigate to the examples folder:

```shell
cd examples
```

4. Run the desired example by executing the corresponding binary, use the following command:

```shell
yarn <binary_name>
```

Here are the available binaries to run the example applications:

* __filter-extrinsics__: Filters extrinsics using HJSON provided filters. Supports pipeable stdin and stdout.
* __follow-transfer-events__: Simple demonstration of dynamic queries.
* __simple-fees__: Calculates simple fee stats for a block range.
* __watch-balances__: Watches the change in balances of big exchange hot wallets from chain storage.
* __watch-contracts__: Watches for contract messages of a specific contract and filters based on configured criteria. Supports pipeable stdout.
* __watch-instantiations__: Watches contract instantiations of the same code hash.
* __watch-sovereign-acc__: Watches the Moonbeam sovereign account on Astar and xcASTR supply on Moonbeam and logs the difference, if any, between the two.
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
you have the option to use either [tsx](https://github.com/privatenumber/tsx) or [Bun](https://bun.sh/).

