export enum WalletEvent {
  Error = 'error',
  Update = 'update',
}

export interface WalletUpdate {
  provider: any
  chainId: string | number
  account: string | null
  connected: boolean
}

export interface WalletFeatures {
  externalConnectedState: boolean
  externalAccountState: boolean
  externalProviderState: boolean
  externalChainIdState: boolean

  wallet_switchEthereumChain: boolean
  wallet_addEthereumChain: boolean
  wallet_updateEthereumChain: boolean
}
