#!/usr/bin/env ts-node-esm

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exit } from 'node:process';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocksInRange
} from '@sodazone/ocelloids';

import {
  filterContractCalls,
  converters
} from '@sodazone/ocelloids-contracts';

interface ContractDetails {
  address: string,
  metadata: string,
  network: string,
  startBlock: number,
  range: number,
  filter: string
}

const contracts: Record<string, ContractDetails> = {
  magink: {
    address: 'apJNVQJ5T4C5gZ1XRPw2MAHcUFxbuHch7BPGQuTyT8DHjeX',
    metadata: 'magink.json',
    network: 'wss://rpc.shibuya.astar.network',
    startBlock: 3944050,
    range: 20,
    filter: JSON.stringify({
      'message.identifier': { $in: ['start', 'claim'] }
    })
  },
  azns_registry: {
    address: '5HfQopC1yQSoG83auWgRLTxhWWFxiVQWT74LLXeXMLJDFBvP',
    metadata: 'azns_registry.json',
    network: 'wss://ws.test.azero.dev',
    startBlock: 34870110,
    range: 30,
    filter: JSON.stringify({
      'message.identifier': 'register'
    })
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hr = [...Array(60)].map(() => '=').join('');

function watcher({ name, verbose }) {
  const names = Object.keys(contracts);
  if (!names.includes(name)) {
    throw new Error(`Contract details not found for ${name}`);
  }
  const {
    address,
    metadata,
    network,
    startBlock,
    range,
    filter
  }: ContractDetails = contracts[name];

  if (verbose) {
    console.log('> Contract name:', name);
    console.log('> Contract address:', address);
    console.log('> Network:', network);
  }
  const contractMetadataJson = readFileSync(path.resolve(path.resolve(__dirname, 'metadata', metadata))).toString();

  const apis = new SubstrateApis({
    network: {
      provider: new WsProvider(network)
    }
  });

  const abi = new Abi(contractMetadataJson);

  apis.rx.network.pipe(
    blocksInRange(startBlock, range, false),
    filterContractCalls(
      abi,
      address,
      JSON.parse(filter)
    )
  ).subscribe({
    next: x => {
      if (verbose) {
        const call = converters.contracts.toNamedPrimitive(x);
        console.log('>', hr);
        console.log('> 💬 Contract Message');
        console.log('>', hr);
        console.log('> Identifier:', x.message.identifier);
        console.log('> Arguments');
        console.log(Object.entries(call.args as any).map(([k, v]) => `> - ${k}: ${v}`).join('\n'));
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
        console.log('>', hr);
        console.log('> 🙌 Scan complete');
        console.log('>', hr);
      }
      exit(0);
    }
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: watch-contracts [options]')
  .example('watch-contracts -n magink', 'watches contract messages of magink contract deployed on Shibuya')
  .option('n', {
    type: 'string',
    alias: 'name',
    default: 'magink',
    describe: 'The contract name',
    requiresArg: true
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'verbose')
  .argv as any;

watcher({
  name: argv.name,
  verbose: argv.verbose
});

