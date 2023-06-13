export interface SubstrateConfig {
  [key: string]: {
    ws?: string,
    http?: string
  }
}

export interface Configuration {
  providers: SubstrateConfig
}
