import type UAuth from '@uauth/js'
import type {
  LoginCallbackOptions,
  UAuthConstructorOptions,
  UserInfo,
} from '@uauth/js'
import {AbstractConnector} from '@web3-react/abstract-connector'
import {
  AbstractConnectorArguments,
  ConnectorEvent,
  ConnectorUpdate,
} from '@web3-react/types'
import {VERSION} from './version'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.WEB3_REACT = VERSION
}

export interface UAuthConnectors {
  injected: AbstractConnector
  walletconnect: AbstractConnector
}

export interface UAuthConnectorOptions
  extends AbstractConnectorArguments,
    Partial<UAuthConstructorOptions> {
  uauth?: UAuth
  connectors: UAuthConnectors
  shouldLoginWithRedirect?: boolean
}

export interface ConnectorLoginCallbackOptions {
  url?: string
  activate: (
    connector: AbstractConnector,
    onError?: (error: Error) => void,
    throwErrors?: boolean,
  ) => Promise<void>
  onError?: (error: Error) => void
  throwErrors?: boolean
}

class UAuthConnector extends AbstractConnector {
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

  private _subConnector?: AbstractConnector
  private _uauth?: UAuth

  constructor(public options: UAuthConnectorOptions) {
    super({supportedChainIds: options.supportedChainIds})
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

  public async activate(): Promise<ConnectorUpdate> {
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

    if ((this as any)?._subConnector?.on) {
      this._subConnector.on(ConnectorEvent.Update, this.handleUpdate)
      this._subConnector.on(ConnectorEvent.Deactivate, this.handleDeactivate)
      this._subConnector.on(ConnectorEvent.Error, this.handleError)
    }

    const update = await this._subConnector!.activate()

    return update
  }

  public deactivate(): void {
    if (this._subConnector) {
      if (!this.uauth.fallbackLogoutOptions.rpInitiatedLogout) {
        this.uauth.logout({rpInitiatedLogout: false})
      }

      if ((this as any)?._subConnector?.removeListener) {
        this._subConnector.removeListener(
          ConnectorEvent.Update,
          this.handleUpdate,
        )
        this._subConnector.removeListener(
          ConnectorEvent.Deactivate,
          this.handleDeactivate,
        )
        this._subConnector.removeListener(
          ConnectorEvent.Error,
          this.handleError,
        )
      }

      this.uauth.logout()

      this._subConnector.deactivate()
    }
  }

  public async isAuthorized(): Promise<boolean> {
    const user = await this.uauth.user()

    if (!user || typeof this.subConnector?.isAuthorized !== 'function') {
      return false
    }

    return this.subConnector.isAuthorized()
  }

  public getProvider(): Promise<any> {
    return this.subConnector.getProvider()
  }

  public getChainId(): Promise<number | string> {
    return this.subConnector.getChainId()
  }

  public getAccount(): Promise<null | string> {
    return this.subConnector.getAccount()
  }

  public get uauth(): UAuth {
    const {
      supportedChainIds,
      connectors,
      uauth,
      shouldLoginWithRedirect,
      ...uauthOptions
    } = this.options

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

  public get subConnector(): AbstractConnector & {
    isAuthorized?(): Promise<boolean>
  } {
    if (this._subConnector == null) {
      throw new Error('no subconnector')
    }

    return this._subConnector
  }

  private handleUpdate = (update: ConnectorUpdate<string | number>) =>
    this.emitUpdate(update)
  private handleDeactivate = () => this.emitDeactivate()
  private handleError = error => this.emitError(error)
}

export default UAuthConnector
