import type UAuth from '@uauth/js'
import type {
  LoginCallbackOptions,
  UAuthConstructorOptions,
  UserInfo,
} from '@uauth/js'
import type {IWalletConnectProviderOptions} from '@walletconnect/types'
import type {API, WalletModule} from 'bnc-onboard/dist/src/interfaces'
import {VERSION} from './version'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.BNC_ONBOARD = VERSION
}

export interface ConstructorOptions extends Partial<UAuthConstructorOptions> {
  uauth?: UAuth
  shouldLoginWithRedirect?: boolean
}

export interface CallbackOptions extends Partial<LoginCallbackOptions> {
  onboard: API
}

export interface ModuleOptions {
  preferred: boolean
  walletconnect: IWalletConnectProviderOptions
}

export default class UAuthBNCOnboard {
  static UAuth: typeof UAuth

  static registerUAuth(pkg: typeof UAuth): void {
    UAuthBNCOnboard.UAuth = pkg
  }

  public static async importUAuth(): Promise<void> {
    if (UAuthBNCOnboard.UAuth == null) {
      UAuthBNCOnboard.UAuth = (await import('@uauth/js').then(
        m => m?.default ?? m,
      )) as typeof UAuth
    }
  }

  private _uauth?: UAuth

  constructor(public options: ConstructorOptions) {}

  public get uauth(): UAuth {
    const {uauth, shouldLoginWithRedirect, ...uauthOptions} = this.options

    if (this._uauth) {
      return this._uauth
    }

    if (uauth) {
      return uauth
    }

    if (UAuthBNCOnboard.UAuth == null) {
      throw new Error('Must import UAuth before constructing a UAuth Object')
    }

    if (!uauthOptions.clientID || !uauthOptions.redirectUri) {
      throw new Error('Incomplete constructor options')
    }

    this._uauth = new UAuthBNCOnboard.UAuth(
      uauthOptions as UAuthConstructorOptions,
    )

    return this._uauth
  }

  async getUAuth(): Promise<UAuth> {
    await UAuthBNCOnboard.importUAuth()
    return this.uauth
  }

  async callbackAndWalletSelect({
    onboard,
    ...options
  }: CallbackOptions): Promise<boolean> {
    await UAuthBNCOnboard.importUAuth()
    if (options.url) {
      await this.uauth.loginCallback(options as LoginCallbackOptions)
    } else {
      await this.uauth.loginCallback()
    }

    return onboard.walletSelect('Unstoppable')
  }

  module({preferred = true, walletconnect}: ModuleOptions): WalletModule {
    return {
      // Metadata about the type of wallet and ux assets
      desktop: true,
      mobile: true,
      // osExclusions: [''],
      preferred: typeof preferred === 'boolean' ? preferred : true,
      type: 'sdk',

      // Metadata about the  this wallet uses
      name: 'Unstoppable',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.7319 2.06934V9.87229L0 19.094L22.7319 2.06934Z" fill="#2FE9FF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M18.4696 1.71387V15.1917C18.4696 19.1094 15.2892 22.2853 11.3659 22.2853C7.44265 22.2853 4.26221 19.1094 4.26221 15.1917V9.51682L8.52443 7.17594V15.1917C8.52443 16.5629 9.63759 17.6745 11.0107 17.6745C12.3839 17.6745 13.497 16.5629 13.497 15.1917V4.4449L18.4696 1.71387Z" fill="#4C47F7"/></svg>',
      // iconSrc: '',
      // iconSrcSet: '',
      // installMessage(wallets: {currentWallet: string, selectedWallet: string}): string {},
      // link: '',

      // The function used to connect with Onboard
      wallet: async ({
        createLegacyProviderInterface,
        createModernProviderInterface,
        resetWalletState,
      }) => {
        await UAuthBNCOnboard.importUAuth()

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
              packageName: '@uauth/bnc-onboard',
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
              packageName: '@uauth/bnc-onboard',
              packageVersion: VERSION,
            })
            user = await this.uauth.user()
          }
        }

        if (!user.wallet_type_hint) {
          throw new Error('no wallet type hint')
        }

        let provider: any
        if (['web3', 'injected'].includes(user.wallet_type_hint)) {
          provider =
            (window as any).ethereum ||
            ((window as any).web3 && (window as any).web3.currentProvider)
        } else if (user.wallet_type_hint === 'walletconnect') {
          const {default: WalletConnectProvider} = await import(
            '@walletconnect/web3-provider'
          )

          provider = new WalletConnectProvider(walletconnect)

          provider.autoRefreshOnNetworkChange = false

          provider.wc.on('disconnect', () => {
            void this.uauth.logout({rpInitiatedLogout: false})
            resetWalletState({disconnected: true, walletName: 'Unstoppable'})
          })

          await provider.enable()
        } else {
          throw new Error('Should never reach here!')
        }

        const walletInterface = provider
          ? typeof provider.enable === 'function'
            ? createModernProviderInterface(provider)
            : createLegacyProviderInterface(provider)
          : null

        if (walletInterface) {
          walletInterface.name = 'Unstoppable'
        }

        return {
          provider,
          interface: walletInterface,
          instance: this.uauth,
        }
      },
    }
  }
}
