import { Configuration } from '../conf/index.js';
import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { Observable, share } from 'rxjs';
import { logger } from '../log/index.js';

export class SubstrateApis {
  private readonly chains: string[] = [];
  private readonly providers: Record<string, WsProvider> = {};
  private readonly apiRx: Record<string, ApiRx> = {};
  private readonly promises: Record<string, ApiPromise> = {};

  constructor(
      private readonly config: Configuration
  ) {
    logger.info('Initialize Substrate APIs');

    this.config.providers.forEach((ws: string, name: string) => {
      logger.info('- Register APIs for provider: [%s, %s]', name, ws);

      const provider = new WsProvider(ws);
      this.providers[name] = provider;

      this.apiRx[name] = new ApiRx({
        provider
      });

      this.promises[name] = new ApiPromise({
        provider
      });

      this.chains.push(name);
    });

    /*
      return new Proxy(this, {
        get(target, prop, receiver) {
          const p = prop.toString()
          if (p in target.chains) {
            return target.promises[p]
          }
          return Reflect.get(target, prop, receiver)
        }
      }) */
  }

  get api(): Record<string, ApiPromise> {
    return new Proxy(this.promises, {
      get(target, prop) {
        // TODO check if exists
        // console.log(prop, target)
        return target[prop.toString()];
      }
    });
  }

  get rx(): Record<string, Observable<ApiRx>> {
    return new Proxy(this.apiRx, {
      get(target, prop) {
        const name = prop.toString();
        // TODO handle not exists
        return target[name].isReady.pipe(share());
      }
    }) as unknown as Record<string, Observable<ApiRx>>;
  }

  async disconnect() {
    const promises = Object.entries(this.providers).map(
      async ([_, provider]) =>  await provider.disconnect()
    );
    return Promise.all(promises);
  }
}
