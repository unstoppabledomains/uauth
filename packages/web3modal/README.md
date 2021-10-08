# @uauth/web3modal

## Installation

```sh
yarn add web3modal @uauth/web3modal @uauth/js @walletconnect/web3-provider
```

NOTE: The `@walletconnect/web3-provider` is not strictly required, but it
provides a more seamless login experiance.

## A Simple Example

### Configuration

```typescript
//
// web3modal.ts
//

import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'
import WalletConnectProvider from '@walletconnect/web3-provider'

// These options are used to construct the UAuthSPA instance.
export const uauthOptions: IUAuthOptions = {
  clientID: 'client_id',
  clientSecret: 'client_secret',
  redirectUri: 'http://localhost:3000',

  // Must include both the openid and wallet scopes.
  scope: 'openid wallet',
}

const providerOptions = {
  // Currently the package isn't inside the web3modal library currently. For now,
  // users must use this libary to create a custom web3modal provider.

  // All custom `web3modal` providers must be registered using the "custom-"
  // prefix.
  'custom-uauth': {
    // The UI Assets
    display: UAuthWeb3Modal.display,

    // The Connector
    connector: UAuthWeb3Modal.connector,

    // The SPA libary
    package: UAuthSPA,

    // The SPA libary options
    options: uauthOptions,
  },

  // For full functionality we include the walletconnect provider as well.
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'INFURA_ID',
    },
  },

  // Include any other web3modal providers here too...
}

export const web3modal = new Web3Modal({providerOptions})

// Register the web3modal so the connector has access to it.
UAuthWeb3Modal.registerWeb3Modal(web3modal)
```

### Usage

Once configured, the `web3modal` library can be used similar to normal.

```typescript
//
// login-page.ts
//

import web3modal from './web3modal'
import Web3 from 'web3'

// On login button click...

const provider = await web3modal.connect()

// Save provider in state
```

The only difference is that you must set up a callback page for the
authorization server to redirect back to.

```typescript
//
// callback-page.ts
//

import UAuthSPA from '@uauth/js'
import * as UAuthWeb3Modal from '@uauth/web3modal'
import {uauthOptions} from './web3modal'

// On page load...

UAuthWeb3Modal.getUAuth(UAuthSPA, uauthOptions)
  .loginCallback()
  .then(async () => {
    const provider = await web3modal.connectTo('custom-uauth')

    // Save provider in state and redirect to success page
  })
  .catch(error => {
    // Redirect to failure page
  })
```

## Reference

### `connector`

```typescript
import type UAuthSPA from '@uauth/js'
import type {IUAuthOptions} from '@uauth/web3modal'

export async function connector(
  UAuth: typeof UAuthSPA,
  opts: IUAuthOptions,
): Promise<any>
```

The `connector` is used to create a provider for the `web3modal` library.

### `display`

```typescript
import type {IProviderDisplay} from 'web3modal'

export const display: IProviderDisplay = { ... }
```

UAuth is not yet nativly integrated into the web3modal library applications must
supply some digital assets for the Web3 Modal UI. These are those assets.

### `registerWeb3Modal`

```typescript
import type Web3Modal from 'web3modal'

export function registerWeb3Modal(web3modal: Web3Modal) => void
```

The `connector` needs access to the `web3modal` instance in order to connect a
provider properly. This function registeres the `web3modal` instance for the
`connector` to use. This function MUST be called for the connector to work.

### `getUAuth`

```typescript
import type UAuthSPA from '@uauth/js'

export function getUAuth(UAuth: typeof UAuthSPA, opts: IUAuthOptions): UAuth {
  return new UAuth(opts)
}
```

Creates a UAuth instance using the package and options.

## Resources

- A more complex [example](../../examples/web3modal/README.md).
- The `web3modal` library [github](https://github.com/Web3Modal/web3modal).
