import { WellKnownChain } from '@substrate/connect';

async function chainSpecOf(conf: Promise<{ chainSpec: string }>) {
  return (await conf).chainSpec;
}

export async function getSpec(chain: string): Promise<string> {
  const knownChain = chain as WellKnownChain;
  switch (knownChain) {
    case WellKnownChain.polkadot: {
      return await chainSpecOf(import('@substrate/connect-known-chains/polkadot'));
    }
    case WellKnownChain.ksmcc3: {
      return await chainSpecOf(import('@substrate/connect-known-chains/ksmcc3'));
    }
    case WellKnownChain.westend2: {
      return await chainSpecOf(import('@substrate/connect-known-chains/westend2'));
    }
    case WellKnownChain.rococo_v2_2: {
      return await chainSpecOf(import('@substrate/connect-known-chains/rococo_v2_2'));
    }
    default:
      throw new Error(`Unknown chain ${knownChain}`);
  }
}
