import {JsonRpcSigner} from '@ethersproject/providers'
import type UAuth from '@uauth/js'
import type {UserInfo} from '@uauth/js'
import {Connector} from '@wagmi/connectors'
import {Ethereum, UserRejectedRequestError, normalizeChainId} from '@wagmi/core'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import {providers} from 'ethers'
import {getAddress} from 'ethers/lib/utils.js'
import 'eventemitter3'
import {Chain, mainnet} from 'wagmi/chains'

import {ConnectorData} from 'wagmi'
import {VERSION} from './version'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.WEB3_REACT = VERSION
}

type UAuthWagmiConnectorOptions = {
  metaMaskConnector?: any
  walletConnectConnector?: any
  shouldLoginWithRedirect?: boolean
  uauth: UAuth
}

class UAuthWagmiConnector extends Connector<
  Ethereum | WalletConnectProvider,
  UAuthWagmiConnectorOptions,
  JsonRpcSigner
> {
  id: string
  name: string
  ready: boolean
  public provider?: Ethereum | WalletConnectProvider | undefined
  private _metaMaskConnector?: any
  private _walletConnectConnector?: any
  private _subConnector?: Connector
  private _uauth: UAuth

  protected onAccountsChanged(accounts: Array<`0x${string}`>): void {
    if (accounts.length === 0) this.emit('disconnect')
    else {
      const account = accounts[0]
      const formattedAddress = account ? getAddress(account) : undefined
      if (formattedAddress) this.emit('change', {account: formattedAddress})
    }
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', {chain: {id, unsupported}})
  }

  protected onDisconnect(): void {
    this.emit('disconnect')
  }

  constructor({
    chains,
    options,
  }: {
    chains?: Chain[]
    options: UAuthWagmiConnectorOptions
  }) {
    super({chains, options})
    this.id = 'custom-uauth'
    this.name = 'UauthWagmiConnector'
    this._metaMaskConnector = options.metaMaskConnector
    this._walletConnectConnector = options.walletConnectConnector
    this.ready = true
    this._uauth = options.uauth
  }

  // Return wagmi ConnectorData
  async connect(): Promise<any> {
    this.emit('message', {type: 'connecting'})

    let user: UserInfo
    try {
      user = await this._uauth.user()
    } catch (error) {
      if (!this._uauth.fallbackLoginOptions.scope.includes('wallet')) {
        throw new Error(
          'Must request the "wallet" scope for connector to work.',
        )
      }

      if (this.options.shouldLoginWithRedirect) {
        await this._uauth.login({
          packageName: '@uauth/wagmi',
          packageVersion: VERSION,
        })

        // NOTE: We don't want to throw because the page will take some time to
        // load the redirect page.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await new Promise<void>(() => {})
        // We need to throw here otherwise typescript won't know that user isn't null.
        throw new Error('Should never get here.')
      } else {
        await this._uauth.loginWithPopup({
          packageName: '@uauth/wagmi',
          packageVersion: VERSION,
        })
        user = await this._uauth.user()
      }
    }

    if (user.wallet_type_hint == null) {
      throw new Error('no wallet type present')
    }

    // Set the underlying subconnector
    if (['web3', 'injected'].includes(user.wallet_type_hint)) {
      this._subConnector = this._metaMaskConnector
    } else if (user.wallet_type_hint === 'walletconnect') {
      this._subConnector = this._walletConnectConnector
    } else {
      throw new Error('Connector not supported')
    }

    // Should be connected, ensure that the subconnector is connected also
    await this._subConnector!.connect()

    // Set the provider using subconnector
    const provider = await this._subConnector?.getProvider()
    this.provider = provider
    if (!this.provider) {
      throw new Error('Provider not found')
    }
    if (provider.on) {
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('chainChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)
    }

    const accountPromise = async (): Promise<`0x${string}`> => {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      })
      const connectedAccount = accounts[0]
      const formattedAddress = getAddress(connectedAccount)
      const account: `0x${string}` = formattedAddress ?? '0x0'
      return account
    }

    const chainPromise = async (): Promise<{
      id: number
      unsupported: boolean
    }> => {
      const providerChain = await provider.request({
        method: 'eth_chainId',
      })
      const id = normalizeChainId(providerChain)
      const unsupported = this.isChainUnsupported(id)
      return {id, unsupported}
    }

    const providerPromise = async (): Promise<any> => {
      return new providers.Web3Provider(provider)
    }

    let connectorData: ConnectorData
    try {
      const data = await Promise.all([
        accountPromise(),
        chainPromise(),
        providerPromise(),
      ])
      connectorData = {
        account: data[0],
        chain: data[1],
        provider: data[2],
      }
      return connectorData
    } catch (error: any) {
      if (error.code === 4001) {
        throw new UserRejectedRequestError(error)
      }
      if (error.code === -32002) {
        throw error instanceof Error ? error : new Error(String(error))
      }
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this._subConnector) {
      if (!this._uauth.fallbackLogoutOptions.rpInitiatedLogout) {
        this._uauth.logout({rpInitiatedLogout: false})
      }

      await (this as any)?._subConnector.disconnect()
    }
  }

  async getAccount(): Promise<`0x${string}`> {
    const provider = await this.getProvider()
    const accounts: string[] = await provider!.request({
      method: 'eth_accounts',
    })
    const account = accounts[0] ? getAddress(accounts[0]) : '0x0'
    return account
  }
  async getChainId() {
    const provider = await this.getProvider()
    const chainId: string | number | bigint = await provider!.request({
      method: 'eth_chainId',
    })
    return normalizeChainId(chainId)
  }

  async getProvider(): Promise<Ethereum | WalletConnectProvider> {
    const subProvider = await this._subConnector?.getProvider()
    return subProvider
  }

  async getSigner({chainId = mainnet.id} = {}): Promise<JsonRpcSigner> {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ])
    return new providers.Web3Provider(
      (provider as providers.ExternalProvider) || providers.JsonRpcProvider,
      chainId,
    ).getSigner(account)
  }
  async isAuthorized() {
    try {
      const account = await this.getAccount()
      return !!account
    } catch {
      return false
    }
  }

  public get subConnector(): Connector & {
    isAuthorized?(): Promise<boolean>
  } {
    if (this._subConnector == null) {
      throw new Error('no subconnector')
    }

    return this._subConnector
  }
}

export default UAuthWagmiConnector
