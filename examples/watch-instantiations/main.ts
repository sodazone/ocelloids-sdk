// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';
import path from 'node:path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocksInRange,
  extractTxWithEvents
} from '@sodazone/ocelloids-sdk';

import {
  contractConstructors,
  converters
} from '@sodazone/ocelloids-sdk-contracts';

function watcher({ metadataPath, codeHash, verbose }) {
  const contractMetadataJson = readFileSync(metadataPath).toString();

  const abi = new Abi(contractMetadataJson);

  if (verbose) {
    console.log(`> Watching for instantiations of contract with code hash ${codeHash}`);
    console.log(`> Contract name: ${abi.info.contract.name.toHuman()}`);
  }

  const apis = new SubstrateApis({
    network: {
      provider: new WsProvider('wss://rococo-contracts-rpc.polkadot.io')
    }
  });

  apis.rx.network.pipe(
    blocksInRange(1951957, 30, false),
    extractTxWithEvents(),
    contractConstructors(
      apis.promise.network,
      abi,
      codeHash
    )
  ).subscribe({
    next: x => {
      const call = converters.contracts.toNamedPrimitive(x);
      if (verbose) {
        console.log('='.repeat(60));
        console.log('> 🛠️  Contract Constructor');
        console.log('='.repeat(60));
        console.log('> Identifier:', x.message.identifier);
        console.log('> Arguments:', call.args);
        console.log('> Context:', x.extrinsic.toHuman());
        console.log('> JSON:');
      }
      console.log(JSON.stringify({
        ...x,
        extrinsic: x.extrinsic.toHuman(),
        events: x.events.map(ev => ev.toHuman())
      }));
    },
    complete: () => {
      if (verbose) {
        console.log('='.repeat(60));
        console.log('> 🙌 Scan complete');
        console.log('='.repeat(60));
      }
      exit(0);
    }
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .example(
    '$0 -v -c 0x6cf11f2c80feaa775afb888442a5857dbb2da91d46f3ff03698a8a45f645667c -p ./game-metadata.json',
    'watches instantiations of the squink-splash contract and outputs verbose logging'
  )
  .option('p', {
    type: 'string',
    alias: 'path',
    describe: 'The path to the metadata file for the contract to watch',
    coerce: p => path.resolve(p),
    demandOption: true,
    requiresArg: true
  })
  .option('c', {
    type: 'string',
    alias: 'codeHash',
    describe: 'The code hash to watch for instantiations',
    demandOption: true
  })
  .option('v', {
    type: 'boolean',
    alias: 'verbose',
    describe: 'Enable verbose logging'
  })
  .help('h')
  .alias('h', 'help')
  .scriptName('watch-instantiations')
  .argv as any;

watcher({
  metadataPath: argv.path,
  codeHash: argv.codeHash,
  verbose: argv.verbose
});