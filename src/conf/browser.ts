import { Configuration } from './config.js';

class BrowserConfiguration implements Configuration {
  public get providers() {
    const providers = new Map<string, string>();

    providers.set('polka', 'wss://localhost:333');

    return providers;
  }
}

export const configuration = new BrowserConfiguration();
