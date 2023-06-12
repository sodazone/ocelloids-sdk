export interface Configuration {
    providers: Map<string, string>
  }

export  interface SubstrateConfig {
    [key: string]: {
      ws: string
    }
  }
