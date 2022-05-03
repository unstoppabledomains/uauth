import type UAuth from '@uauth/js'
import type {UAuthConstructorOptions, UserInfo} from '@uauth/js'
import type {IWalletConnectProviderOptions} from '@walletconnect/types'
import {WalletInit, createEIP1193Provider} from '@web3-onboard/common'

export interface ConstructorOptions {
  uauth: UAuth
  shouldLoginWithRedirect?: boolean
  walletconnect: IWalletConnectProviderOptions
}

export default function uauthBNCModule(
  options: ConstructorOptions,
): WalletInit {
  return () => {
    return {
      label: 'Unstoppable',
      getIcon: async () =>
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.7319 2.06934V9.87229L0 19.094L22.7319 2.06934Z" fill="#2FE9FF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M18.4696 1.71387V15.1917C18.4696 19.1094 15.2892 22.2853 11.3659 22.2853C7.44265 22.2853 4.26221 19.1094 4.26221 15.1917V9.51682L8.52443 7.17594V15.1917C8.52443 16.5629 9.63759 17.6745 11.0107 17.6745C12.3839 17.6745 13.497 16.5629 13.497 15.1917V4.4449L18.4696 1.71387Z" fill="#4C47F7"/></svg>',
      getInterface: async () => {
        const uauth = options.uauth
        if (uauth == null) {
          throw new Error(
            'Must import UAuth before constructing a UAuth Object',
          )
        }
        let user: UserInfo
        try {
          user = await uauth.user()
        } catch (error) {
          if (!uauth.fallbackLoginOptions.scope.includes('wallet')) {
            throw new Error(
              'Must request the "wallet" scope for connector to work.',
            )
          }

          if (options.shouldLoginWithRedirect) {
            await uauth.login()

            // NOTE: We don't want to throw because the page will take some time to
            // load the redirect page.
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            await new Promise<void>(() => {})
            // We need to throw here otherwise typescript won't know that user isn't null.
            throw new Error('Should never get here.')
          } else {
            await uauth.loginWithPopup()
            user = await uauth.user()
          }
        }
        if (!user.wallet_type_hint) {
          throw new Error('no wallet type hint')
        }
        let provider
        if (['web3', 'injected'].includes(user.wallet_type_hint)) {
          provider =
            (window as any).ethereum ||
            ((window as any).web3 && (window as any).web3.currentProvider)
        } else if (user.wallet_type_hint === 'walletconnect') {
          const {default: WalletConnectProvider} = await import(
            '@walletconnect/web3-provider'
          )

          provider = new WalletConnectProvider(options.walletconnect)

          provider.autoRefreshOnNetworkChange = false

          provider.wc.on('disconnect', () => {
            // resetWalletState({disconnected: true, walletName: 'Unstoppable'})
          })

          // await provider.enable()
        }
        return {provider: createEIP1193Provider(provider)}
      },
    }
  }
}
