import type UAuth from '@uauth/js'
import type {UAuthConstructorOptions, UserInfo} from '@uauth/js'

import AbstractWeb3Connector from './AbstractWeb3Connector'

import Moralis from 'moralis'

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
  type = 'UauthConnect'

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

  public async activate(): Promise<any> {
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
      this._subConnector = UAuthMoralisConnector.options.connectors.injected
    } else if (user.wallet_type_hint === 'walletconnect') {
      this._subConnector =
        UAuthMoralisConnector.options.connectors.walletconnect
    } else {
      throw new Error('Connector not supported')
    }

    const update = await Moralis.authenticate(this._subConnector)

    return update
  }

  public deactivate(): void {
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

    if (
      !uauthOptions.clientID ||
      !uauthOptions.clientSecret ||
      !uauthOptions.redirectUri
    ) {
      throw new Error('Incomplete constructor options')
    }

    this._uauth = new UAuthMoralisConnector.UAuth(
      uauthOptions as UAuthConstructorOptions,
    )

    return this._uauth
  }
}

export default UAuthMoralisConnector
