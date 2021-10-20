# Unstoppable Authentication (UAuth)

Maybe Unstoppauthable...

## Core libraries

- [`@uauth/js`](./packages/js) - SDK used to integrate into SPA applications.
- [`@uauth/node`](./packages/node) - SDK used to integrate into Server-side applications.

## Wallet middleware libraries

- [`@uauth/web3-react`](./packages/web3-react) - Middleware used to help integrate `@uauth/js` into `web3-react` applications.
- [`@uauth/web3modal`](./packages/web3modal) - Middleware used to help integrate `@uauth/js` into `web3modal` applications.
- [`@uauth/bnc-onboard`](./packages/bnc-onboard) - Middleware used to help integrate `@uauth/js` into `bnc-onboard` applications.

### Utility libraries

You should not need to use or expect these libraries to remain stable.

- [`@uauth/common`](./packages/common) - Common utilities used by various uauth libraries
- [`@uauth/modal`](./packages/modal) - A simple `react` modal used by `@uauth/js` to facilitate sign in.

### Related libraries

- [`@unstoppabledomains/resolution`](https://github.com/unstoppabledomains/resolution) - The library used to resolve domains by all the uauth libraries.

## Examples

- [`spa`](./examples/spa) - Basic integration using the `@uauth/js` library.
- [`web3-react`](./examples/web3-react) - Integration using the `@uauth/js` & `@uauth/web3-react` library.
- [`web3modal`](./examples/web3modal) - Integration using the `@uauth/js` & `@uauth/web3modal` library.
- [`bnc-onboard`](./examples/bnc-onboard) - Integration using the `@uauth/js` & `@uauth/bnc-onboard` library.
- [`server`](./examples/server) - Integration using the `@uauth/node` library.
