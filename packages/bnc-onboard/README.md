# @uauth/bnc-onboard

## Installation

```sh
yarn add bnc-onboard @uauth/bnc-onboard @uauth/js @walletconnect/web3-provider
```

### Migration from <0.6.x

Because popups are a more integration friendly approach for integrations the `@uauth/bnc-onboard` library now uses them by default. If you want the "old" redirect functinality you need to initialize the Module with this option.

```typescript
// ... other uauthOptions properties
shouldLoginWithRedirect: true
```

## A Simple Example

### Configuration

```typescript
//
// uauthOnboard.ts
//

import UAuthBncOnboard from '@uauth/bnc-onboard'

const uauthOnboard = new UAuthBncOnboard({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,\
  // Scope must include openid and wallet
  scope: 'openid wallet',
})
```

You can also construct a UAuth instance before hand and use that to create the
library.

```typescript
import UAuth from '@uauth/js'

const uauthOnboard = new UAuthBncOnboard({
  uauth: new UAuth({
    clientID: process.env.REACT_APP_CLIENT_ID!,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
    redirectUri: process.env.REACT_APP_REDIRECT_URI!,
    postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
    scope: 'openid wallet',
  }),
})
```

Once configured, the `bnc-onboard` library needs to be configured.

```typescript
//
// onboard.ts
//

import initOnboard from 'bnc-onboard'

const onboard = initOnboard({
  dappId: process.env.REACT_APP_ONBOARD_KEY!,
  networkId: 1,
  walletSelect: {
    wallets: [
      {
        walletName: 'metamask',
        preferred: true,
      },
      {
        walletName: 'walletConnect',
        preferred: true,
        infuraKey: process.env.REACT_APP_INFURA_ID!,
      },
      // This creates a custom wallet module. See here: https://docs.blocknative.com/onboard#creating-custom-modules
      uauthOnboard.module({
        // Mark true if you want Unstoppable to be
        preferred: true,
        // Onboard uses a store system that makes it impossible to read the
        // state of other wallets. This means that we have to supply a seperate
        // configuration to the @walletconnect/web3-provider instance.
        // See here: https://docs.walletconnect.com/1.0/quick-start/dapps/web3-provider
        walletconnect: {
          infuraId: process.env.REACT_APP_INFURA_ID!,
        },
      }),
    ],
  },
})
```

### Usage

```typescript
//
// login-page.ts
//

import onboard from './onboard'

// On login button click...

await onboard.walletSelect()

await onboard.walletCheck()
```

## If `shouldLoginWithRedirect` is `true`

The only difference is that you must set up a callback page for the
authorization server to redirect back to.

```typescript
//
// callback-page.ts
//

import onboard from './onboard'
import uauthOnboard from './uauthOnboard'

// On page load...

uauthOnboard
  .callbackAndWalletSelect({onboard})
  .then(() => {
    // Redirect to success page
  })
  .catch(error => {
    // Redirect to failure page
  })
```

## Caching Wallet

Blocknative has [documentation](https://docs.blocknative.com/onboard#caching-wallet-selection) about caching wallets here. This code won't quite work out of the box because onboard doesn't know if the token from the last login session is still valid. To fix this you need to check before selecting the Unstoppable wallet.

```typescript
const previouslySelectedWallet = window.localStorage.getItem('selectedWallet')
if (previouslySelectedWallet != null) {
  // We check to see if the last connected wallet was the Unstoppable one.
  if (previouslySelectedWallet === 'Unstoppable') {
    // If it is then we try to retrieve the user and select the wallet.
    // Otherwise we don't try to reconnect.
    await uauthOnboard
      .getUAuth()
      .then(async uauth => {
        await uauth.user()
        await onboard.walletSelect('Unstoppable')
      })
      .catch(() => {
        window.localStorage.removeItem('selectedWallet')
      })
  } else {
    await onboard.walletSelect(previouslySelectedWallet)
  }
}
```

### `UAuthBNCOnboard` default export

```typescript
import type {WalletModule} from 'bnc-onboard/dist/src/interfaces'
import type UAuth from '@uauth/js'
import type {
  ConstructorOptions,
  CallbackOptions,
  ModuleOptions,
} from '@uauth/bnc-onboard'

export default class UAuthBNCOnboard {
  // A reference to the UAuth library. Used to construct a UAuth instance if one
  // isn't passed in the constructor.
  public static UAuth: typeof UAuth

  // Assigns pkg to UAuthConnector.UAuth.
  public static registerUAuth(pkg: typeof UAuth): void

  // Dynamically imports UAuth and assigns it to UAuthConnector.UAuth.
  public static async importUAuth(): Promise<void>

  constructor(public options: ConstructorOptions) {}

  // Gets the local UAuth instance.
  public get uauth(): UAuth

  // Calls UAuthBNCOnboard.importUAuth and gets the local UAuth instance.
  public async getUAuth(): Promise<UAuth>

  // Calls this.uauth.loginCallback and selects wallet using onboard instance.
  public async callbackAndWalletSelect(
    options: CallbackOptions,
  ): Promise<boolean>

  // Creates a wallet module used to instanciate an Onboard instance
  public module({preferred = true, walletconnect}: ModuleOptions): WalletModule
}
```

## Resources

- A more complex [example](../../examples/bnc-onboard/README.md).
- The `bnc-onboard` library [github](https://github.com/NoahZinsmeister/web3-react).
- The `bnc-onboard` [docs](https://docs.blocknative.com/onboard).
