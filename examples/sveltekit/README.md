# SvelteKit Example

This is an example demonstrating the use of [`@uauth/js`](../../packages/js) with [SvelteKit](https://kit.svelte.dev/).

## Running this Project

1. Build your local `uauth` packages.
    ```shell
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/js` package to this project.
    ```shell
    # Inside this project folder
    yarn add @uauth/js
    ```
    
2. Install the project dependencies.
    ```shell
    yarn install
    ```

3. Start the development server.
    ```shell
    yarn dev
    ```

## Files

- [lib/uauth.ts](./src/lib/uauth.ts) - The configuration for `@uauth/js`.
- [routes/index.svelte](./src/routes/index.svelte) - A login page implementation.