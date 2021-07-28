import {IWalletConnectProviderOptions} from '@walletconnect/types'
import WalletConnectProvider from '@walletconnect/web3-provider'
import BaseProviderWallet from './BaseProviderWallet'
import BaseWallet from './BaseWallet'
import {WalletFeatures} from './types'

export default class WalletConnectWallet extends BaseProviderWallet {
  public walletConnectProvider?: WalletConnectProvider

  constructor(public options: IWalletConnectProviderOptions = {}) {
    super()

    if (!options.chainId) {
      this.options.chainId = 1
    }
  }

  async connect(): Promise<void> {
    if (!this.walletConnectProvider) {
      this.walletConnectProvider = new WalletConnectProvider(this.options)
    }

    if (!this.walletConnectProvider.wc.connected) {
      await this.walletConnectProvider.wc.createSession()
    }

    this.handleChainChanged(this.walletConnectProvider!.chainId)
    this.handleAccountsChanged(await this.walletConnectProvider.enable())

    this.walletConnectProvider.on('connect', this.handleConnect)
    this.walletConnectProvider.on('disconnect', this.handleDisconnect)
    this.walletConnectProvider.on('chainChanged', this.handleChainChanged)
    this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged)
  }

  async connected(): Promise<boolean> {
    return this.walletConnectProvider?.wc.connected || false
  }

  async disconnect(): Promise<void> {
    await this.walletConnectProvider?.disconnect()
  }

  async provider(): Promise<WalletConnectProvider> {
    if (!this.walletConnectProvider) {
      throw new BaseWallet.NoProviderError()
    }

    return this.walletConnectProvider
  }

  async supports(): Promise<Partial<WalletFeatures>> {
    return {}
  }

  // TODO: Figure out if this is a good idea.
  async clientVersion(): Promise<string> {
    return 'WalletConnect/' + (await super.clientVersion())
  }
}
