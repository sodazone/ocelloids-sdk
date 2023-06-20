# Ocelloids

Ocelloids is an open-source software development kit that provides a framework for building monitoring applications specifically designed for Substrate-based networks.
With Ocelloids you can easily set up and implement complex multi-chain monitoring logic.

## Project Layout

The Ocelloids repository has the following directory structure:

```
./packages
├── core                    # Ocelloids SDK implementation
│   ├── src
│   │   ├── apis            # Multi-chain APIs
│   │   ├── configuration   # Configuration
│   │   ├── converters      # Chain data type conversions
│   │   ├── observables     # Reactive emitters
│   │   └── operators       # Reactive operators
│   │   └── subjects        # Reactive subjects
├── dev                     # Utility scripts for development        
└── test                    # Chain test data and mocks
```


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

### TBD Tips

After build test...
Run Command in VS Code
TypeScript: Reload project
