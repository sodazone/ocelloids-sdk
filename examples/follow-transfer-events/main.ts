#!/usr/bin/env node

import { WsProvider } from '@polkadot/api';
import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import type { } from '@polkadot/api-augment';

import { tap } from 'rxjs';
import { exit } from 'process';

import { Graph } from 'graph-data-structure';

import {
  SubstrateApis,
  blocksInRange,
  config,
  filterEvents,
  ControlQuery
} from '@sodazone/ocelloids';

const graph = Graph();
const KRAKEN = '12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW';
graph.addNode(KRAKEN);

function transfersOf(addresses: string[]) {
  return {
    $and: [
      { section: 'balances' },
      { method: 'Transfer' },
      {
        $or: [
          { 'data.from': { $in: addresses } },
          { 'data.to': { $in: addresses } }
        ]
      }
    ]
  };
}

const dynamicQuery = new ControlQuery(transfersOf(graph.nodes()));

const apis = new SubstrateApis({
  polkadot: {
    provider: new WsProvider(
      config.networks.polkadot
    )
  }
});

const startBlock = 16134439;
const blockCount = 80;

console.log('='.repeat(80));
console.log('🛸 Ocelloids Follow Transfer Demo');
console.log('='.repeat(80));
console.log(`Address: ${KRAKEN}
Network: Polkadot
Start Block: ${startBlock}
Block Count: ${blockCount}`);
console.log('-'.repeat(80));

apis.rx.polkadot.pipe(
  // We need sequential blocks since the order of discovery matters
  blocksInRange(startBlock, blockCount),
  tap((x: SignedBlockExtended) => console.log(
    'Block Height',
    x.block.header.number.toHuman()
  )),
  filterEvents(dynamicQuery)
).subscribe({
  next: event => {
    console.log('Event', event.toHuman());

    if (apis.promise.polkadot.events.balances.Transfer.is(event) ) {
      const transfer = event.data;
      const from = transfer.from.toPrimitive();
      const to = transfer.to.toPrimitive();

      let w = 1;
      if (graph.hasEdge(from, to)) {
        w += graph.getEdgeWeight(from, to);
        graph.removeEdge(from, to);
      }
      graph.addEdge(from, to, w);
    }

    const prevLen = graph.nodes().length;
    const nodes = graph.nodes();

    if (nodes.length > prevLen) {
      console.log('Monitoring', nodes);
      dynamicQuery.change(transfersOf(nodes));
    }
  },
  complete: () => {
    console.log(
      'Graph',
      JSON.stringify(graph.serialize(), null, 2)
    );
    exit(0);
  }
});

