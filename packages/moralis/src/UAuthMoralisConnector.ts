/* eslint-disable @typescript-eslint/ban-ts-comment */
import type UAuth from '@uauth/js'
import type {UAuthConstructorOptions, UserInfo} from '@uauth/js'

import AbstractWeb3Connector from './AbstractWeb3Connector'

import {getMoralisRpcs} from './MoralisRpcs'
import verifyChainId from './Utils'

interface Window {
  WalletConnectProvider: any
  ethereum?: any
  Buffer?: any
}

// eslint-disable-next-line no-var
declare var window: Window

export interface UAuthMoralisConnectors {
  injected: any | undefined
  walletconnect: any | undefined
}

export interface UAuthConnectorOptions
  extends Partial<UAuthConstructorOptions> {
  uauth?: UAuth
  connectors: UAuthMoralisConnectors
  shouldLoginWithRedirect?: boolean
}

class UAuthMoralisConnector extends AbstractWeb3Connector {
  type = 'uauth'

  static UAuth: typeof UAuth
  static options: UAuthConnectorOptions

  public static async importUAuth(): Promise<void> {
    if (UAuthMoralisConnector.UAuth == null) {
      UAuthMoralisConnector.UAuth = (await import('@uauth/js').then(
        m => m?.default ?? m,
      )) as typeof UAuth
    }
  }

  public static setUAuthOptions(_options: UAuthConnectorOptions) {
    UAuthMoralisConnector.options = _options
  }

  private _subConnector?: any | undefined = null
  private _uauth?: UAuth

  verifyEthereumBrowser() {
    if (!window.ethereum) {
      throw new Error('Non ethereum enabled browser')
    }
  }
  public async activate({
    // @ts-ignore
    chainId: providedChainId,
    // @ts-ignore
    mobileLinks,
  } = {}): Promise<any> {
    // cleanup old data
    try {
      await this.deactivate()
      this.uauth.logout({rpInitiatedLogout: false})
    } catch (error) {
      // Do nothing
    }
    await UAuthMoralisConnector.importUAuth()

    let user: UserInfo
    try {
      user = await this.uauth.user()
    } catch (error) {
      if (!this.uauth.fallbackLoginOptions.scope.includes('wallet')) {
        throw new Error(
          'Must request the "wallet" scope for connector to work.',
        )
      }

      if (UAuthMoralisConnector.options.shouldLoginWithRedirect) {
        await this.uauth.login()

        // NOTE: We don't want to throw because the page will take some time to
        // load the redirect page.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await new Promise<void>(() => {})
        // We need to throw here otherwise typescript won't know that user isn't null.
        throw new Error('Should never get here.')
      } else {
        await this.uauth.loginWithPopup()
        user = await this.uauth.user()
      }
    }

    if (user.wallet_type_hint == null) {
      throw new Error('no wallet type present')
    }

    if (['web3', 'injected'].includes(user.wallet_type_hint)) {
      this._subConnector = 'web3'
      this.verifyEthereumBrowser()
      const [accounts, chainId] = await Promise.all([
        window.ethereum.request({
          method: 'eth_requestAccounts',
        }),
        window.ethereum.request({method: 'eth_chainId'}),
      ])
      console.log(accounts)
      const account = accounts[0] ? accounts[0].toLowerCase() : null

      const verfiedChainId = verifyChainId(chainId)

      const provider = window.ethereum
      this.chainId = verfiedChainId
      this.account = account
      this.provider = provider
    } else if (user.wallet_type_hint === 'walletconnect') {
      this._subConnector = 'walletconnect'
      UAuthMoralisConnector.options.connectors.walletconnect
      let WalletConnectProvider
      const config = {
        rpc: getMoralisRpcs('WalletConnect'),
        chainId: providedChainId,
        qrcodeModalOptions: {
          mobileLinks,
        },
      }

      try {
        window.Buffer = window.Buffer || (await import('buffer'))?.Buffer
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        WalletConnectProvider = (await import('@walletconnect/web3-provider'))
          ?.default
      } catch (error) {
        // Do nothing. User might not need walletconnect
        console.log(error)
      }

      if (!WalletConnectProvider) {
        throw new Error(
          'Cannot enable WalletConnect: dependency "@walletconnect/web3-provider" is missing',
        )
      }

      if (typeof WalletConnectProvider === 'function') {
        this.provider = new WalletConnectProvider(config)
      } else {
        this.provider = new window.WalletConnectProvider(config)
      }
      if (!this.provider) {
        throw new Error(
          'Could not connect with WalletConnect, error in connecting to provider',
        )
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const accounts = await this.provider.enable()
      this.account = accounts[0].toLowerCase()
      const {chainId} = this.provider
      const verifiedChainId = verifyChainId(chainId)
      this.chainId = verifiedChainId
      this.subscribeToEvents(this.provider)
    } else {
      throw new Error('Connector not supported')
    }

    return {
      provider: this.provider,
      account: this.account,
      chainId: this.chainId,
    }
  }

  public async deactivate() {
    this.account = null
    this.chainId = null
    if (this._subConnector === 'walletconnect') {
      this.unsubscribeToEvents(this.provider)
      if (this.provider) {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await this.provider.disconnect()
        } catch (error) {
          console.log(error)
        }
      }
    }
    if (this._subConnector) {
      if (!this.uauth.fallbackLogoutOptions.rpInitiatedLogout) {
        this.uauth.logout({rpInitiatedLogout: false})
      }
    }
  }

  public get uauth(): UAuth {
    const {uauth, ...uauthOptions} = UAuthMoralisConnector.options

    if (uauth) {
      return uauth
    }

    if (this._uauth) {
      return this._uauth
    }

    if (UAuthMoralisConnector.UAuth == null) {
      throw new Error('Must import UAuth before constructing a UAuth Object')
    }

    if (!uauthOptions.clientID || !uauthOptions.redirectUri) {
      throw new Error('Incomplete constructor options')
    }

    this._uauth = new UAuthMoralisConnector.UAuth(
      uauthOptions as UAuthConstructorOptions,
    )

    return this._uauth
  }
}

export default UAuthMoralisConnector
