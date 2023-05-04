import type UAuthSPA from '@uauth/js'
import type {UAuthConstructorOptions, UserInfo} from '@uauth/js'
import Web3Modal, {
  connectors,
  IAbstractConnectorOptions,
  IProviderDisplay,
} from 'web3modal'
import {VERSION} from './version'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.WEB3MODAL = VERSION
}

export interface IUAuthOptions
  extends Partial<IAbstractConnectorOptions>,
    UAuthConstructorOptions {
  shouldLoginWithRedirect?: boolean
}

let w3m: Web3Modal
export const registerWeb3Modal: (web3modal: Web3Modal) => void = web3modal => {
  w3m = web3modal
}

export const display: IProviderDisplay = {
  name: 'Unstoppable',
  logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIyLjczMTkgMi4wNjkzNFY5Ljg3MjI5TDAgMTkuMDk0TDIyLjczMTkgMi4wNjkzNFoiIGZpbGw9IiMyRkU5RkYiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE4LjQ2OTYgMS43MTM4N1YxNS4xOTE3QzE4LjQ2OTYgMTkuMTA5NCAxNS4yODkyIDIyLjI4NTMgMTEuMzY1OSAyMi4yODUzQzcuNDQyNjUgMjIuMjg1MyA0LjI2MjIxIDE5LjEwOTQgNC4yNjIyMSAxNS4xOTE3VjkuNTE2ODJMOC41MjQ0MyA3LjE3NTk0VjE1LjE5MTdDOC41MjQ0MyAxNi41NjI5IDkuNjM3NTkgMTcuNjc0NSAxMS4wMTA3IDE3LjY3NDVDMTIuMzgzOSAxNy42NzQ1IDEzLjQ5NyAxNi41NjI5IDEzLjQ5NyAxNS4xOTE3VjQuNDQ0OUwxOC40Njk2IDEuNzEzODdaIiBmaWxsPSIjNEM0N0Y3Ii8+PC9zdmc+',
  description: 'Enter your Unstoppable domain name',
}

export const getUAuth = (
  UAuth: typeof UAuthSPA,
  opts: IUAuthOptions,
): UAuthSPA => {
  return new UAuth(opts)
}

export const connector = async (
  UAuth: typeof UAuthSPA,
  opts: IUAuthOptions,
): Promise<any> => {
  const uauth = new UAuth(opts)

  let user: UserInfo
  try {
    user = await uauth.user()
  } catch (error) {
    if (!uauth.fallbackLoginOptions.scope.includes('wallet')) {
      throw new Error('Must request the "wallet" scope for connector to work.')
    }

    if (opts.shouldLoginWithRedirect) {
      await uauth.login({
        packageName: '@uauth/web3modal',
        packageVersion: VERSION,
      })

      // NOTE: We don't want to throw because the page will take some time to
      // load the redirect page.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await new Promise<void>(() => {})
      // We need to throw here otherwise typescript won't know that user isn't null.
      throw new Error('Should never get here.')
    } else {
      await uauth.loginWithPopup({
        packageName: '@uauth/web3modal',
        packageVersion: VERSION,
      })
      user = await uauth.user()
    }
  }

  if (user.wallet_type_hint == null) {
    throw new Error('no wallet type present')
  }

  let provider: any
  if (['web3', 'injected'].includes(user.wallet_type_hint)) {
    provider = connectors.injected()
  } else if (user.wallet_type_hint === 'walletconnect') {
    const id = 'walletconnect'

    provider = connectors.walletconnect(
      (w3m as any).providerController.getProviderOption(id, 'package'),
      {
        network: opts.network,
        ...(w3m as any).providerController.getProviderOption(id, 'options'),
      },
    )
  } else {
    throw new Error('Connector not supported')
  }

  return provider
}
