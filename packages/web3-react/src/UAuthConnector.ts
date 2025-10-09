import type UAuth from '@uauth/js'
import type {
  LoginCallbackOptions,
  UAuthConstructorOptions,
  UserInfo,
} from '@uauth/js'
import {Actions, Connector, Provider} from '@web3-react/types'
import {VERSION} from './version'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.WEB3_REACT = VERSION
}

export interface UAuthConnectors {
  injected: Connector
  walletconnect: Connector
}

type UAuthConnectorOptions = UAuthConstructorOptions & {
  uauth?: UAuth
  connectors: UAuthConnectors
  shouldLoginWithRedirect?: boolean
}
export interface UAuthConnectorConstructorArgs {
  actions: Actions
  options: UAuthConnectorOptions
  onError?: (error: Error) => void
}

type MetaMaskProvider = Provider & {
  isMetaMask?: boolean
  isConnected?: () => boolean
  providers?: MetaMaskProvider[]
}
export interface ConnectorLoginCallbackOptions {
  url?: string
  activate: (
    connector: Connector,
    onError?: (error: Error) => void,
    throwErrors?: boolean,
  ) => Promise<void>
  onError?: (error: Error) => void
  throwErrors?: boolean
}

export function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}
class UAuthConnector extends Connector {
  public declare provider?: MetaMaskProvider
  private options: UAuthConnectorOptions
  private _subConnector?: Connector
  private _uauth?: UAuth
  private eagerConnection?: Promise<void>
  static UAuth: typeof UAuth

  static registerUAuth(pkg: typeof UAuth): void {
    UAuthConnector.UAuth = pkg
  }

  public static async importUAuth(): Promise<void> {
    if (UAuthConnector.UAuth == null) {
      UAuthConnector.UAuth = (await import('@uauth/js').then(
        m => m?.default ?? m,
      )) as typeof UAuth
    }
  }

  constructor({actions, options, onError}: UAuthConnectorConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  async callbackAndActivate<T>(
    options: ConnectorLoginCallbackOptions,
  ): Promise<void> {
    await UAuthConnector.importUAuth()

    const {activate, onError, throwErrors, ...callbackOptions} = options

    if (callbackOptions.url) {
      await this.uauth.loginCallback(callbackOptions as LoginCallbackOptions)
    } else {
      await this.uauth.loginCallback()
    }

    return activate(this, onError, throwErrors)
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    await UAuthConnector.importUAuth()

    let user: UserInfo
    try {
      user = await this.uauth.user()
    } catch (error) {
      if (!this.uauth.fallbackLoginOptions.scope.includes('wallet')) {
        throw new Error(
          'Must request the "wallet" scope for connector to work.',
        )
      }

      if (this.options.shouldLoginWithRedirect) {
        await this.uauth.login({
          packageName: '@uauth/web3-react',
          packageVersion: VERSION,
        })

        // NOTE: We don't want to throw because the page will take some time to
        // load the redirect page.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await new Promise<void>(() => {})
        // We need to throw here otherwise typescript won't know that user isn't null.
        throw new Error('Should never get here.')
      } else {
        await this.uauth.loginWithPopup({
          packageName: '@uauth/web3-react',
          packageVersion: VERSION,
        })
        user = await this.uauth.user()
      }
    }

    if (user.wallet_type_hint == null) {
      throw new Error('no wallet type present')
    }

    if (['web3', 'injected'].includes(user.wallet_type_hint)) {
      this._subConnector = this.options.connectors.injected
    } else if (user.wallet_type_hint === 'walletconnect') {
      this._subConnector = this.options.connectors.walletconnect
    } else {
      throw new Error('Connector not supported')
    }

    await this._subConnector!.activate()
    if (this._subConnector.provider) {
      this.provider = this._subConnector.provider
    }
    if (!this.provider) return cancelActivation()

    this.provider.on('connect', ({chainId}): void => {
      this.actions.update({chainId: parseChainId(chainId)})
    })

    this.provider.on('disconnect', (error): void => {
      // 1013 indicates that MetaMask is attempting to reestablish the connection
      // https://github.com/MetaMask/providers/releases/tag/v8.0.0
      if (error.code === 1013) {
        console.debug(
          'MetaMask logged connection error 1013: "Try again later"',
        )
        return
      }
      this.actions.resetState()
      this.onError?.(error)
    })

    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({chainId: parseChainId(chainId)})
    })

    this.provider.on('accountsChanged', (accounts: string[]): void => {
      if (accounts.length === 0) {
        // handle this edge case by disconnecting
        this.actions.resetState()
      } else {
        this.actions.update({accounts})
      }
    })

    return Promise.all([
      this.provider.request({method: 'eth_chainId'}) as Promise<string>,
      this.provider.request({method: 'eth_requestAccounts'}) as Promise<
        string[]
      >,
    ])
      .then(([chainId, accounts]) => {
        const receivedChainId = parseChainId(chainId)
        return this.actions.update({chainId: receivedChainId, accounts})
      })
      .catch(error => {
        cancelActivation?.()
        throw error
      })
  }

  public deactivate(): void {
    if (this._subConnector) {
      if (!this.uauth.fallbackLogoutOptions.rpInitiatedLogout) {
        this.uauth.logout({rpInitiatedLogout: false})
      }

      this.actions.resetState()

      if ((this as any)?._subConnector?.deactivate) {
        void (this as any)?._subConnector.deactivate()
      } else if ((this as any)?._subConnector?.resetState) {
        void (this as any)?._subConnector.resetState()
      }
    }
  }

  public async isAuthorized(): Promise<boolean> {
    const user = await this.uauth.user()

    return Boolean(user && this._subConnector?.provider)
  }

  public getProvider(): Provider | undefined {
    return this.subConnector?.provider
  }

  public get uauth(): UAuth {
    const {connectors, uauth, shouldLoginWithRedirect, ...uauthOptions} =
      this.options

    if (uauth) {
      return uauth
    }

    if (this._uauth) {
      return this._uauth
    }

    if (UAuthConnector.UAuth == null) {
      throw new Error('Must import UAuth before constructing a UAuth Object')
    }

    if (!uauthOptions.clientID || !uauthOptions.redirectUri) {
      throw new Error('Incomplete constructor options')
    }

    this._uauth = new UAuthConnector.UAuth(
      uauthOptions as UAuthConstructorOptions,
    )

    return this._uauth
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

export default UAuthConnector
