#!/usr/bin/env ts-node-esm

import { exit } from 'node:process';

import { WsProvider } from '@polkadot/api';
import { defineCommand, runMain } from 'citty';

import {
  SubstrateApis,
  convert,
  blocks,
  blockAt,
  extractExtrinsics,
  extractTxWithEvents
} from '@sodazone/ocelloids';

// eslint-disable-next-line no-shadow
enum ExtractType {
  TxWithEvents = 'txWithEvents',
  Extrinsics = 'extrinsics'
}

const extractors : Record<ExtractType, any> = {
  extrinsics: extractExtrinsics,
  txWithEvents: extractTxWithEvents
};

function cdump({ url, type, blockHeight }: {
  url: string,
  type: string,
  blockHeight: string
}) {
  const apis = new SubstrateApis(
    {
      polkadot: {
        provider: new WsProvider(url)
      }
    }
  );

  const extractor = extractors[type];

  if (extractor === undefined) {
    throw new Error(`Unkwnown type ${type}`);
  }

  const singleBlock = blockHeight !== undefined;
  const sourceBlocks = singleBlock
    ? blockAt(blockHeight)
    : blocks();

  apis.rx.polkadot.pipe(
    sourceBlocks,
    extractor(),
    convert()
  ).subscribe({
    next: value => {
      console.log(JSON.stringify(value));
    },
    error: console.error,
    complete: () => {
      if (singleBlock) {
        exit(0);
      }
    }
  });
}
const typeNames = Object.entries(ExtractType).map(([_, v]) => v.toString()).join(', ');
const main = defineCommand({
  meta: {
    name: 'cdump',
    version: '0.0.1',
    description: 'Outputs named primitive objects.',
  },
  args: {
    blockHeight: {
      type: 'string',
      alias: 'b',
      description: 'The block height to dump. Defaults to latest.'
    },
    type: {
      default: ExtractType.TxWithEvents,
      type: 'string',
      alias: 't',
      description: `The extract type. ${typeNames}`
    },
    url: {
      default: 'wss://rpc.polkadot.io',
      type: 'string',
      alias: 'u'
    },
  },
  run({ args }) {
    cdump(args);
  },
});

runMain(main as any);
