/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
} from '@sodazone/ocelloids';

import {
  filterContractCalls,
  converters
} from '@sodazone/ocelloids-contracts';

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
