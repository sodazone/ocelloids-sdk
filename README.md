# Ocelloids

Ocelloids is an open-source software development kit that provides a framework for building monitoring applications specifically designed for Substrate-based networks.
With Ocelloids you can easily set up and implement complex multi-chain monitoring logic.

## Project Layout

The Ocelloids repository utilizes workspaces for modularization and organization.

The repository contains two main folders: `packages` and `apps`.

### Packages

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

### Apps

The `apps` folder contains demonstration applications in the `apps/demo` directory and development support tools in the `apps/dev` directory.

These applications include functionalities such as chain data capture, providing useful features for development and showcasing the capabilities of the Ocelloids framework.

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

### Tips

#### VS Code

If you encounter the issue of `@sodazone/ocelloids-test` being marked as unresolved 
in the `spec` test files after building the project, you can resolve it by following these steps:

* Open any typescript file of the project.
* Run the command "TypeScript: Reload project" to reload the TypeScript project configuration.


