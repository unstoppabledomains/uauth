# @uauth/web3-onboard

## Installation

```sh
yarn add b@uauth/web3-onboard @uauth/js
```

### Migration from <0.6.x

Because popups are a more integration friendly approach for integrations the `@uauth/web3-onboard` library now uses them by default. If you want the "old" redirect functinality you need to initialize the Module with this option.

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

const uauth = new UAuth({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  fallbackIssuer: process.env.REACT_APP_FALLBACK_ISSUER!,
  scope: 'openid wallet',
})
const uauthOptions = {
  uauth: uauth,
  walletconnect: {
    infuraId: process.env.REACT_APP_INFURA_ID!,
  },
}
const uauthModule = uauthBNCModule(uauthOptions)
const onboard = Onboard({
  wallets: [uauthModule]
})
```

Once configured, the `web3-onboard/core` library needs to be configured.

```typescript
//
// onboard.ts
//

import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import uauthBNCModule from '@uauth/web3-onboard'

...
const uauthModule = uauthBNCModule(uauthOptions)
...

const onboard = initOnboard({
    wallets: [injected, uauthModule],
    ...
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

await onboard.connectWallet()

```


## Resources

- A more complex [example](../../examples/web3-onboard/README.md).
- The `web3-onboard` library [github](https://github.com/blocknative/web3-onboard).
