# @uauth/js

## Installation

```
yarn add @uauth/js @unstoppabledomains/resolution
```

## Setup

```typescript
import UAuth from '@uauth/js'

const uauth = new UAuth({
  // Client credentials copied from https://unstoppabledomains.com/app-dashboard
  clientID: process.env.UAUTH_CLIENT_ID!,
  clientSecret: process.env.UAUTH_CLIENT_SECRET!,

  // Requested scopes.
  scope: 'openid email wallet',

  // Redirect Uris copied from https://unstoppabledomains.com/app-dashboard
  redirectUri: process.env.UAUTH_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.UAUTH_POST_LOGOUT_REDIRECT_URI!,
})
```

### Referals

If you have a referal link you can configure the library to use that referal link on the Get a Domain link on the bottom right of the modal by configuring the following setting.

```typescript
const uauth = new UAuth({
  // Other options...
  uiOptions: {
    getADomainLink: "https://unstoppabledomains.com/?ref=my_referal_code"
  }
})
```



### Methods

#### `uauth.login()`

1. Exposes modal to allow users to select domain.
2. Queries the blockchain to find if an auth server has been configured otherwise uses fallback.
3. Redirects the user to the auth server with a OIDC compliant authorization request.
4. After every authorization attempt the server will redirect the user to the `redirectUri` specified at instanciation.

#### `uauth.loginCallback()`

1. Parses authorization code found in current uri.
2. Exchanges authorization code for access and id tokens.
3. Stores authorization (id and access tokens) inside cache, the default cache is `window.localStorage`.

#### `uauth.logout()`

1. Uses cached authorization to create a logout uri.
2. Redirects to that uri.
3. After every logout attempt the server will redirect the user to the `postLogoutRedirectUri` specified at instanciation.

#### `uauth.user()`

1. Returns the cached data about the user as long as it's still valid.
