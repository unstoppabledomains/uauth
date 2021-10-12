# Unstoppable Authentication (UAuth)

Maybe Unstoppauthable...

## Libraries

- [`@uauth/js`](./packages/js/README.md) - SDK used to integrate into SPA applications.
- [`@uauth/node`](./packages/node/README.md) - SDK used to integrate into Server-side applications.
- [`@uauth/web3-react`](./packages/web3-react/README.md) - Middleware used to help integrate `@uauth/js` into `web3-react` applications.
- [`@uauth/web3modal`](./packages/web3modal/README.md) - Middleware used to help integrate `@uauth/js` into `web3modal` applications.

### Utility libraries

You should not need to use or expect these libraries to remain stable.

- [`@uauth/common`](./packages/common) - Common utilities used by various uauth libraries
- [`@uauth/modal`](./packages/modal) - A simple `react` modal used by `@uauth/js` to facilitate sign in.

### Related libraries

- `@unstoppabledomains/resolution` - The library used to resolve domains by all the uauth applications.

## Examples

- [`spa`](./examples/spa/README.md) - Basic integration using the `@uauth/js` library.
- [`web3-react`](./examples/web3-react/README.md) - Integration using the `@uauth/js` & `@uauth/web3-react` library.
- [`web3modal`](./examples/web3modal/README.md) - Integration using the `@uauth/js` & `@uauth/web3modal` library.
- [`server`](./examples/server) - Integration using the `@uauth/node` library.
