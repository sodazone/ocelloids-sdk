import { Configuration } from './config.js';

export class BrowserConfiguration implements Configuration {
  readonly providers: Map<string, string>;

  constructor(providers: Map<string, string>) {
    this.providers = providers;
  }
}
