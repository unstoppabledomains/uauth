# SvelteKit Example

This project was created with [SvelteKit](https://kit.svelte.dev/).

## Notes for building

- `@uauth/js` now depends on the WebCrypto Standard alone for all cryptographic functions.

- `@uauth/js` no longer needs any polyfills to work.

- `@uauth/js` requires the window object to be accessable when importing it.

  - This means that you cannot import the library at the top-level if you want to keep SvelteKit's SSR system in place. Instead, we are dynamically importing the library.

## Files

- [lib/uauth.ts](./src/lib/uauth.ts) - The configuration for `@uauth/js`.
- [routes/index.svelte](./src/routes/index.svelte) - A login page implementation.

## Resources

- This is an example demonstrating the use of [`@uauth/js`](../../packages/js)
