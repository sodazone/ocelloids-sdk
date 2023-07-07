# Ocelloids Core Module

![npm](https://img.shields.io/npm/v/sodazone/ocelloids)

The Ocelloids Core Module provides base abstractions, reactive operators, and pallet-independent functionality.

## Usage

Please, refer to the main [README](https://github.com/sodazone/ocelloids/) for basic usage snippets.

Additionally, check out the [examples/](https://github.com/sodazone/ocelloids/tree/main/examples) folder for example applications.

## Logging

Ocelloids supports configuring debug logger outputs to aid in development.

The table below displays the available loggers and their descriptions:

| Logger Name | Description |
| ----------- | ----------- |
| oc-ops-mongo-filter | Outputs the transformed object data in "named primitive" format before filtering in the `mongo-filter` operator. |
| oc-blocks | Outputs the current block number in block-related observables. |

To enable debugging logs for a specific category, use the `DEBUG` environment variable with the corresponding logger name.

For example, to enable debugging logs for the "oc-ops-mongo-filter" category, you can run the following command:

```shell
DEBUG=oc-ops-mongo-filter yarn filter-fee-events
```

You can specify multiple logger names separated by a comma, as shown in the example below:

```shell
DEBUG=oc-ops-mongo-filter,oc-blocks yarn filter-fee-events
```

These loggers provide valuable information that can assist with data filtering and tracking contextual information.

## Layout

The `packages/core` module source folder is structured as follows:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
|  apis                        | Multi-chain APIs                          |
|  configuration               | Configuration                             |
|  converters                  | Chain data type conversions               |
|  observables                 | Reactive emitters                         |
|  operators                   | Reactive operators                        |
|  subjects                    | Reactive subjects                         |
|  types                       | Extended types                            |

