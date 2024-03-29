/* eslint-disable @typescript-eslint/no-unused-vars */
import {JsonRpcSigner} from '@ethersproject/providers'
import type UAuth from '@uauth/js'
import type {UserInfo} from '@uauth/js'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import {providers} from 'ethers'
import {getAddress} from 'ethers/lib/utils.js'
import type {Chain} from 'wagmi/chains'

import {VERSION} from './version'
import EventEmitter = require('eventemitter3')

const MAINNET_ID = 1

const normalizeChainId = (chainId: string | number | BigInt): number => {
  return Number(chainId)
}

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

type ConnectorData<Provider = any> = {
  account?: `0x${string}`
  chain?: {
    id: number
    unsupported: boolean
  }
  provider?: Provider
}

interface ConnectorEvents<Provider = any> {
  change(data: ConnectorData<Provider>): void
  connect(data: ConnectorData<Provider>): void
  message({type, data}: {type: string; data?: unknown}): void
  disconnect(): void
  error(error: Error): void
}

class UAuthWagmiConnector<
  Provider = any,
  Options = UAuthWagmiConnectorOptions,
  Signer = JsonRpcSigner,
> extends EventEmitter<ConnectorEvents<Provider>> {
  [x: string]: any
  id: string
  name: string
  ready: boolean
  public provider?:
    | WalletConnectProvider
    | providers.ExternalProvider
    | providers.JsonRpcFetchFunc
    | undefined
    | any
  // | Ethereum
  public options: UAuthWagmiConnectorOptions
  private _metaMaskConnector?: any
  private _walletConnectConnector?: any
  private _subConnector?: any
  private _uauth: UAuth
  private chains: Chain[] | undefined

  protected onAccountsChanged(accounts: Array<`0x${string}`>): void {
    if (accounts.length === 0) this.emit('disconnect')
    else {
      const currentAccount = accounts[0]
      const formattedAddress = currentAccount
        ? (getAddress(currentAccount) as `0x${string}`)
        : undefined
      if (formattedAddress) this.emit('change', {account: formattedAddress})
    }
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId)
    const unsupported = false
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
    super()
    this.options = options
    this.chains = chains
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

    // Set the provider using subconnector
    const provider = await this._subConnector?.getProvider()

    if (!provider) {
      throw new Error('Provider not found')
    }
    if (provider.on) {
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('chainChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)
    }

    // Should be connected, ensure that the subconnector is connected also
    await this._subConnector!.connect()

    const accountPromise = async (): Promise<`0x${string}`> => {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      })
      const connectedAccount = accounts[0]
      const formattedAddress = getAddress(connectedAccount) as `0x${string}`
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
      // const unsupported = this.isChainUnsupported(id)
      return {id, unsupported: false}
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
      // if (error.code === 4001) {
      //   throw new UserRejectedRequestError(error)
      // }
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
    const account = accounts[0]
      ? (getAddress(accounts[0]) as `0x${string}`)
      : '0x0'
    return account
  }
  async getChainId() {
    const provider = await this.getProvider()
    const chainId: string | number | bigint = await provider!.request({
      method: 'eth_chainId',
    })
    return normalizeChainId(chainId)
  }

  // Provider should be of type: Ethereum | WalletConnectProvider
  async getProvider(): Promise<WalletConnectProvider | any> {
    const subProvider = await this._subConnector?.getProvider()
    return subProvider
  }

  async getSigner({chainId = MAINNET_ID} = {}): Promise<JsonRpcSigner> {
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

  public get subConnector(): any & {
    isAuthorized?(): Promise<boolean>
  } {
    if (this._subConnector == null) {
      throw new Error('no subconnector')
    }

    return this._subConnector
  }
}

export default UAuthWagmiConnector
