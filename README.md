<div align="center">

# Ocelloids
Substrate monitoring SDK

<img
  src="https://github.com/sodazone/ocelloids/blob/main/.github/assets/ocesp_250-min.png?raw=true"
  width="250"
  height="auto"
  alt=""
/>

![npm](https://img.shields.io/npm/v/sodazone/ocelloids?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/sodazone/ocelloids?style=for-the-badge)

</div>

---

**Etymology** _ocellus_ + _-oid_

**Noun** ocelloid (_plural_ ocelloids)

> (microbiology) a cellular structure found in unicellular microorganisms that is analogous in structure and function to eyes, which focus, process and detect light.

---

Ocelloids is an open-source software development kit that provides a framework for building monitoring applications specifically designed for Substrate-based networks.
With Ocelloids you can easily implement sophisticated multi-chain monitoring logic.

## Features

* **Composable Reactive Streams** — Easily source, transform, and react to blockchain data using composable reactive streams.
* **Powerful Query Operators** — Simplify data filtering with integrated operators that support complex queries in the Mongo query language, including support for big numbers.
* **Flexible Type Conversions** — Seamlessly convert data into a terse queryable format.
* **Abstraction of Common Patterns** — Simplify development and reduce boilerplate code by abstracting common patterns such as utility batch calls.
* **Multi-Chain Support** — Interact with multiple networks.
* **Pallet Use Cases** — Components designed for specific pallet use cases, such as tracking calls and events from the contracts pallet.

## Development

### Requirements

* [Node.js](https://nodejs.org/en/) >=18.14
* [yarn](https://yarnpkg.com/getting-started/install) >=3.x.x

### Install

Install the latest LTS version of [Node.js](https://nodejs.org/en/).

At the root of the project:

1. Enable [Corepack](https://github.com/nodejs/corepack#how-to-install)

```
corepack enable
```

2. Install dependencies

```
yarn install
```

3. Build Ocelloids libraries

```
yarn build
```

### Project Layout

The Ocelloids repository utilizes workspaces for modularization and organization.

The repository contains two main folders: `packages` and `apps`.

#### Packages

The `packages` folder contains the Ocelloids SDK implementation, which is further divided into core, test, and use case modules.

Here is the high-level structure of the `packages/core` module source folder:

| Directory                    | Description                               |
|------------------------------|-------------------------------------------|
| `apis`                       | Multi-chain APIs                          |
| `configuration`              | Configuration                             |
| `converters`                 | Chain data type conversions               |
| `observables`                | Reactive emitters                         |
| `operators`                  | Reactive operators                        |
| `subjects`                   | Reactive subjects                         |
| `types`                      | Extended types                            |

The `packages/test` module includes network captured test data and mocks.

#### Apps

The `apps` folder contains demonstration applications in the `apps/demo` directory and development support tools in the `apps/dev` directory.

These applications include functionalities such as chain data capture, providing useful features for development and showcasing the capabilities of the Ocelloids SDK.

### Troubleshooting

#### VS Code

If you encounter the issue of `@sodazone/ocelloids-test` being marked as unresolved 
in the `spec` test files after building the project, you can resolve it by following these steps:

* Open any typescript file of the project.
* Run the command "TypeScript: Reload project" to reload the TypeScript project configuration.


