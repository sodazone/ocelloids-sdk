#!/usr/bin/env ts-node-esm

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocksInRange,
  extractTxWithEvents
} from '@sodazone/ocelloids';

import {
  contractConstructors,
  converters
} from '@sodazone/ocelloids-contracts';

const apis = new SubstrateApis({
  network: {
    provider: new WsProvider('wss://rococo-contracts-rpc.polkadot.io')
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractMetadataJson = readFileSync((path.resolve(__dirname, 'game-metadata.json'))).toString();

const abi = new Abi(contractMetadataJson);

apis.rx.network.pipe(
  blocksInRange(1951957, 30, false),
  extractTxWithEvents(),
  contractConstructors(
    apis.promise.network,
    abi,
    '0x6cf11f2c80feaa775afb888442a5857dbb2da91d46f3ff03698a8a45f645667c'
  )
).subscribe({
  next: x => {
    const call = converters.contracts.toNamedPrimitive(x);
    console.log('='.repeat(60));
    console.log('> 🛠️  Contract Constructor');
    console.log('='.repeat(60));
    console.log('> Identifier:', x.message.identifier);
    console.log('> Arguments:', call.args);
    console.log('> Context:', x.extrinsic.toHuman());
  },
  complete: () => {
    console.log('='.repeat(60));
    console.log('> 🙌 Scan complete');
    console.log('='.repeat(60));
    exit(0);
  }
});