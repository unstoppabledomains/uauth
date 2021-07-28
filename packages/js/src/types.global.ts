declare global {
  interface Window {
    ethereum?: any
    web3?: {currentProvider: any}
    BinanceChain: any
  }

  // const __DEV__: boolean
}

export {}
