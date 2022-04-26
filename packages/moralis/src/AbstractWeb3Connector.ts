import EventEmitter from 'events'
import {EthereumEvents, ConnectorEvents} from './Events'

class AbstractWeb3Connector extends EventEmitter {
  type = 'abstract'
  network = 'evm'
  account = null
  chainId = null
  provider = null

  constructor() {
    super()
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleConnect = this.handleConnect.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
  }

  subscribeToEvents(provider) {
    if (provider) this.provider = provider
    if (provider && provider.on) {
      provider.on(EthereumEvents.CHAIN_CHANGED, this.handleChainChanged)
      provider.on(EthereumEvents.ACCOUNTS_CHANGED, this.handleAccountsChanged)
      provider.on(EthereumEvents.CONNECT, this.handleConnect)
      provider.on(EthereumEvents.DISCONNECT, this.handleDisconnect)
    }
  }

  unsubscribeToEvents(provider) {
    if (provider && provider.removeListener) {
      provider.removeListener(
        EthereumEvents.CHAIN_CHANGED,
        this.handleChainChanged,
      )
      provider.removeListener(
        EthereumEvents.ACCOUNTS_CHANGED,
        this.handleAccountsChanged,
      )
      provider.removeListener(EthereumEvents.CONNECT, this.handleConnect)
      provider.removeListener(EthereumEvents.DISCONNECT, this.handleDisconnect)
    }
  }

  async activate(): Promise<unknown> {
    throw new Error('Not implemented: activate()')
  }

  /**
   * Updates account and emit event, on EIP-1193 accountsChanged events
   */
  handleAccountsChanged(accounts) {
    const account = accounts && accounts[0] ? accounts[0].toLowerCase() : null
    this.account = account
    this.emit(ConnectorEvents.ACCOUNT_CHANGED, account)
  }

  /**
   * Updates chainId and emit event, on EIP-1193 accountsChanged events
   */
  handleChainChanged(chainId) {
    this.chainId = chainId
    this.emit(ConnectorEvents.CHAIN_CHANGED, chainId)
  }

  handleConnect(connectInfo) {
    this.emit(ConnectorEvents.CONNECT, connectInfo)
  }

  handleDisconnect(error) {
    this.emit(ConnectorEvents.DISCONNECT, error)
  }
}

export default AbstractWeb3Connector
