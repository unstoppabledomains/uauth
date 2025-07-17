# triggering ci
# Unstoppable Authentication (UAuth)

Maybe Unstoppauthable...

## Core libraries

- [`@uauth/js`](./packages/js) - SDK used to integrate into SPA applications.
- [`@uauth/node`](./packages/node) - SDK used to integrate into Server-side applications.

## Wallet middleware libraries

- [`@uauth/web3-react`](./packages/web3-react) - Middleware used to help integrate `@uauth/js` into `web3-react` applications.
- [`@uauth/web3modal`](./packages/web3modal) - Middleware used to help integrate `@uauth/js` into `web3modal` applications.
- [`@uauth/web3-onboard`](./packages/web3-onboard/) - Middleware used to help integrate `@uauth/js` into `web3-onboard` applications.
- [`@uauth/bnc-onboard`](./packages/bnc-onboard) - Middleware used to help integrate `@uauth/js` into `bnc-onboard` applications.
- [`@uauth/moralis`](./packages/moralis/) - Middleware used to help integrate `@uauth/js` into `moralis` applications.

### Utility libraries

You should not need to use or expect these libraries to remain stable.

- [`@uauth/common`](./packages/common) - Common utilities used by various uauth libraries

### Related libraries

- [`@unstoppabledomains/resolution`](https://github.com/unstoppabledomains/resolution) - The library used to resolve domains by all the uauth libraries.

## Examples

- [`spa`](./examples/spa) - Basic integration using the `@uauth/js` library.
- [`web3-react`](./examples/web3-react) - Integration using the `@uauth/js` & `@uauth/web3-react` library.
- [`web3modal`](./examples/web3modal) - Integration using the `@uauth/js` & `@uauth/web3modal` library.
- [`web3-onboard`](./examples/web3-onboard/) - Integration using the `@uauth/js` & `@uauth/web3-onboard` library.
- [`bnc-onboard`](./examples/bnc-onboard) - Integration using the `@uauth/js` & `@uauth/bnc-onboard` library.
- [`moralis`](./examples/moralis/) - Integration using the `@uauth/js` & `@uauth/moralis` library.
- [`sveltekit`](./examples/sveltekit) - Integration using the `sveltekit` framework and `@uauth/js`.
- [`server`](./examples/server) - Integration using the `@uauth/node` library.

## Documentation

For a step by step integration guide and documentation please see our docs. [`login docs`](https://docs.unstoppabledomains.com/login-with-unstoppable/)

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more.

## Get help

[Join our discord community](https://discord.gg/unstoppabledomains) and ask questions.

## Help us improve

We're always looking for ways to improve how developers use and integrate our products into their applications. We'd love to hear about your experience to help us improve by [taking our survey](https://form.typeform.com/to/uHPQyHO6).
