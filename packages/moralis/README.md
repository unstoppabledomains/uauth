# @uauth/moralis

## Installation

```sh
yarn add @uauth/moralis react-moralis moralis
```

### Configuration

```typescript
//
// connectors.ts
//

import {UAuthMoralisConnector} from '@uauth/moralis'

// Instanciate your other connectors.
export const injected = {}

export const walletconnect = {provider: 'walletconnect'}

UAuthMoralisConnector.setUAuthOptions({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  fallbackIssuer: process.env.REACT_APP_FALLBACK_ISSUER!,

  // Scope must include openid and wallet
  scope: 'openid wallet',
  // Injected and walletconnect connectors are required
  connectors: {injected, walletconnect},
});

export const uauth = {connector: UAuthMoralisConnector};

const connectors: Record<string, AbstractConnector> = {
  injected,
  walletconnect,
  uauth,
}

export default connectors
```


### Usage

Once configured, the `react-moralis` library can be used similar to normal.

```typescript
//
// login-page.ts
//

import {useMoralis} from 'react-moralis'
import React from 'react'
import {uauth} from './connectors'

// On login button click...

async function handleUAuthConnect() {
  const {authenticate} = useMoralis()

  await authenticate(uauth)
}
```

## Resources

- A more complex [example](../../examples/moralis/README.md).
- The `react-moralis` library [github](https://github.com/MoralisWeb3/react-moralis).
