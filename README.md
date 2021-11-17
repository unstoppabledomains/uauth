# Unstoppable Authentication (UAuth)

Maybe Unstoppauthable...

## Notes on versioning

Until the library reaches `v1.0.0` each minor bump might be breaking. We will try to keep versions as stable as we can throughout development, but there will be no guarantees. However, each patch bump will not be breaking.

**For now it is recommended to install versions of packages using a tilda `~` instead of a caret `^` (the default).**

Yarn has the ability to install packages this way without having to mess with your package.json by installing packages using the `--tilde` flag:

```sh
yarn add --tilde @uauth/js
yarn add -T @uauth/js
```

Once we release the package for version `v1.0.0`, only major releases will be breaking and developers can install the package using the `^` again.

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
- [`@uauth/dom-ui`](./packages/dom-ui) - A simple DOM-based UI used by `@uauth/js` to facilitate sign in.
- [`@uauth/abstract-ui`](./packages/abstract-ui) - The UI interface used by `@uauth/js` to facilitate sign in.

### Related libraries

- [`@unstoppabledomains/resolution`](https://github.com/unstoppabledomains/resolution) - The library used to resolve domains by all the uauth libraries.

## Examples

- [`spa`](./examples/spa) - Basic integration using the `@uauth/js` library.
- [`web3-react`](./examples/web3-react) - Integration using the `@uauth/js` & `@uauth/web3-react` library.
- [`web3modal`](./examples/web3modal) - Integration using the `@uauth/js` & `@uauth/web3modal` library.
- [`bnc-onboard`](./examples/bnc-onboard) - Integration using the `@uauth/js` & `@uauth/bnc-onboard` library.
- [`sveltekit`](./examples/sveltekit) - Integration using the `sveltekit` framework and `@uauth/js`.
- [`server`](./examples/server) - Integration using the `@uauth/node` library.
