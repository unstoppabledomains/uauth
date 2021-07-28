import '../types.global'
import BaseProviderWallet from './BaseProviderWallet'
import BaseWallet from './BaseWallet'
import {WalletFeatures} from './types'

interface ProviderWalletOptions {
  detectProvider?(): any
}

export default class InjectedConnectWallet extends BaseProviderWallet {
  constructor(public options: ProviderWalletOptions = {}) {
    super()
  }

  async connect(): Promise<void> {
    const provider = await this.provider()

    if (provider.on) {
      provider.on('connect', this.handleConnect)
      provider.on('chainChanged', this.handleChainChanged)
      provider.on('accountsChanged', this.handleAccountsChanged)
      provider.on('disconnect', this.handleDisconnect)
    }

    const send = this.sendFromProvider(provider)

    this.handleChainChanged(await this.chainId())

    const accounts = await send({method: 'eth_requestAccounts'})

    this.handleAccountsChanged(accounts)
  }

  async connected(): Promise<boolean> {
    const provider = await this.provider()

    return provider.isMetaMask
      ? provider.isConnected()
      : Boolean(await this.account())
  }

  async disconnect(): Promise<void> {
    const provider = await this.provider()

    if (provider.removeListener) {
      provider.removeListener('connect', this.handleConnect)
      provider.removeListener('chainChanged', this.handleChainChanged)
      provider.removeListener('accountsChanged', this.handleAccountsChanged)
      provider.removeListener('disconnect', this.handleDisconnect)
    }
  }

  async provider(): Promise<any> {
    let provider
    if (this.options.detectProvider) {
      provider = this.options.detectProvider()
    }

    if (window.ethereum) {
      provider = window.ethereum
    }

    if (window.web3) {
      provider = window.web3.currentProvider
    }

    if (window.BinanceChain) {
      provider = window.BinanceChain
    }

    if (!provider) {
      throw new BaseWallet.NoProviderError()
    }

    return provider
  }

  async supports(): Promise<Partial<WalletFeatures>> {
    const provider = await this.provider()

    if (provider.isMetaMask) {
      return {
        externalAccountState: true,
        externalChainIdState: true,
        externalConnectedState: true,
        externalProviderState: true,
        wallet_addEthereumChain: true,
        wallet_switchEthereumChain: true,
        wallet_updateEthereumChain: true,
      }
    }

    return {}
  }
}
