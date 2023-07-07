import { formatBalance } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';

export function initFromChainInfo(apiPromise: ApiPromise, verbose = false) {
  apiPromise.isReady.then(api => {
    const chainInfo = api.registry.getChainProperties();
    if (chainInfo === undefined) {
      throw new Error('Unable to retrieve chain info');
    }
    const { tokenDecimals, tokenSymbol } = chainInfo;

    if (verbose) {
      console.log('> Chain Decimals:', tokenDecimals.toHuman());
      console.log('> Chain Symbol:', tokenSymbol.toHuman());
    }

    formatBalance.setDefaults({
      decimals: tokenDecimals.unwrapOrDefault().toArray().map(v => v.toNumber()),
      unit: tokenSymbol.unwrapOrDefault().toArray().map(v => v.toString())
    });
  });
}

export function red(text: string) {
  return `\u001b[31m${text}\u001b[39m`;
}

export function blue(text: string) {
  return `\u001b[34m${text}\u001b[39m`;
}
