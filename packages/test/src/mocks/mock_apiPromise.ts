import { ApiPromise } from '@polkadot/api';
import { Event } from '@polkadot/types/interfaces';

export const mockPromiseApi = {
  events: {
    contracts: {
      Instantiated: {
        is: (event: Event) => event.method === 'Instantiated'
          && event.section === 'contracts'
      }
    }
  },
  query: {
    contracts: {
      contractInfoOf: () => {}
    }
  }
} as unknown as ApiPromise;