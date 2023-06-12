import config from 'config';

import { Configuration, SubstrateConfig } from './config.js';

class FileConfiguration implements Configuration {
  public get providers() {
    const providers = new Map<string, string>();
    const confs: SubstrateConfig = config.get('substrate');
    for (const k in confs) {
      if (confs.hasOwnProperty(k)) {
        providers.set(k, confs[k].ws);
      }
    }
    return providers;
  }
}

export const configuration = new FileConfiguration();
