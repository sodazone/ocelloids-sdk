// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';

import { parse } from 'hjson';

import { WsProvider } from '@polkadot/api';
import { Abi } from '@polkadot/api-contract';

import {
  SubstrateApis,
  blocksInRange,
  blocks
} from '@sodazone/ocelloids-sdk';

import {
  filterContractCalls,
  converters
} from '@sodazone/ocelloids-sdk-contracts';

import { printHeader, objectToStructuredString } from './utils.js';

export async function watcher({ configPath, verbose }) {
  const c = readFileSync(configPath).toString();
  const config = parse(c);

  if (config.getBlocksInRange && (config.startBlock === undefined || config.range === undefined)) {
    throw new Error('startBlock and range needs to be configured when getBlockInRange is set to true.');
  }

  if (verbose) {
    console.log('> Contract address:', config.address);
    console.log('> Network:', config.network);
    console.log(
      config.getBlocksInRange ?
        `> Scanning blocks from ${config.startBlock} to ${config.startBlock + config.range}` :
        '> Scanning new blocks'
    );
  }

  let apiOptions = {
    provider: new WsProvider(config.network)
  };

  if (config.customTypes) {
    const customTypes = readFileSync(path.resolve(configPath, '../', config.customTypes)).toString();

    apiOptions = {
      ...apiOptions,
      ...JSON.parse(customTypes)
    };
  }

  const apis = new SubstrateApis({
    network: apiOptions
  });

  const contractMetadataJson = readFileSync((path.resolve(configPath, '../', config.metadata))).toString();

  const abi = new Abi(contractMetadataJson);

  apis.rx.network.pipe(
    config.getBlocksInRange ?
      blocksInRange(config.startBlock, config.range, false) :
      blocks(),
    filterContractCalls(
      abi,
      config.address,
      config.callsCriteria,
      config.extrinsicsCriteria
    )
  ).subscribe({
    next: x => {
      if (verbose) {
        const call = converters.contracts.toNamedPrimitive(x);
        printHeader('> 💬 Contract Message', '=', 60);
        console.log('> Identifier:', x.message.identifier);
        console.log('> Arguments:', objectToStructuredString(call.args));
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
        printHeader('> 🙌 Scan complete', '=', 60);
      }
      exit(0);
    }
  });
}
