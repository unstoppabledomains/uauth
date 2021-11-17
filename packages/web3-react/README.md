# @uauth/web3-react

## Installation

```sh
yarn add @uauth/web3-react @web3-react/core @web3-react/injected-connector @web3-react/walletconnect-connector @web3-react/abstract-connector
```

### Migration from <0.6.x

Because popups are a more integration friendly approach for integrations the `@uauth/web3-react` library now uses them by default. If you want the "old" redirect functinality you need to initialize the `UAuthConnector` with this setting.

```typescript
// ... other UAuthConnector options
shouldLoginWithRedirect: true
```

### Configuration

```typescript
//
// connectors.ts
//

import {UAuthConnector} from '@uauth/web3-react'
import {InjectedConnector} from '@web3-react/injected-connector'
import {WalletConnectConnector} from '@web3-react/walletconnect-connector'
import type {AbstractConnector} from '@web3-react/abstract-connector'

// Instanciate your other connectors.
export const injected = new InjectedConnector({supportedChainIds: [1]})

export const walletconnect = new WalletConnectConnector({
  infuraId: process.env.REACT_APP_INFURA_ID!,
  qrcode: true,
})

export const uauth = new UAuthConnector({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
  // Scope must include openid and wallet
  scope: 'openid wallet',

  // Injected and walletconnect connectors are required.
  connectors: {injected, walletconnect},
})

const connectors: Record<string, AbstractConnector> = {
  injected,
  walletconnect,
  uauth,
}

export default connectors
```

You can also construct a UAuth instance before hand and use that to create the
connector.

```typescript
import UAuth from '@uauth/js'

const uauth = new UAuthConnector({
  uauth: new UAuth({
    clientID: process.env.REACT_APP_CLIENT_ID!,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
    redirectUri: process.env.REACT_APP_REDIRECT_URI!,
    postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
    scope: 'openid wallet',
  }),
  connectors: {injected, walletconnect},
})
```

### Usage

Once configured, the `web3-react` library can be used similar to normal.

```typescript
//
// login-page.ts
//

import {useWeb3React} from '@web3-react/core'
import {WalletConnectConnector} from '@web3-react/walletconnect-connector'
import React from 'react'
import {uauth} from './connectors'

// On login button click...

async function handleUAuthConnect() {
  const {activate} = useWeb3React()

  await activate(uauth)
}
```

## If `shouldLoginWithRedirect` is `true`

The only difference is that you must set up a callback page for the
authorization server to redirect back to.

```typescript
//
// callback-page.ts
//

import {uauth} from './connectors'

// On page load...

const {activate} = useWeb3React()

useEffect(() => {
  uauth
    .callbackAndActivate({activate})
    .then(() => {
      // Redirect to success page
    })
    .catch(error => {
      // Redirect to failure page
    })
}, [])
```

## Reference

### `UAuthConnector` default export

```typescript
import type {
  UAuthConnectors,
  UAuthConnectorOptions,
  ConnectorLoginCallbackOptions,
} from '@uauth/web3-react'
import type UAuth from '@uauth/js'

export default class UAuthConnector extends AbstractConnector {
  // A reference to the UAuth library. Used to construct a UAuth instance if one
  // isn't passed in the constructor.
  static UAuth: typeof UAuth

  // Assigns pkg to UAuthConnector.UAuth.
  static registerUAuth(pkg: typeof UAuth): void

  // Dynamically imports UAuth and assigns it to UAuthConnector.UAuth.
  public static async importUAuth(): Promise<void>

  constructor(public options: UAuthConnectorOptions) {}

  // Calls this.uauth.loginCallback and activates the connector using the
  // activate argument.
  async callbackAndActivate<T>(
    options: ConnectorLoginCallbackOptions,
  ): Promise<void>

  // Gets connector used internally to connect into `web3-react`.
  public get subConnector(): AbstractConnector & {
    isAuthorized?(): Promise<boolean>
  }

  // Gets the local UAuth instance.
  public get uauth(): UAuth
}
```

## Resources

- A more complex [example](../../examples/web3-react/README.md).
- The `web3-react` library [github](https://github.com/NoahZinsmeister/web3-react).
