# SvelteKit Example

This is an example demonstrating the use of [`@uauth/js`](../../packages/js) with [SvelteKit](https://kit.svelte.dev/).

## Running this Project

1. Add `localhost:5000` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. Copy the `clientID` from your **Client Metadata** to the `Uauth` constructor options in `index.svelte`.

3. Build your local `uauth` packages.
    ```sh
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/js` package to this project.
    ```sh
    # Inside this project folder
    yarn add @uauth/js
    ```
    
4. Install the project dependencies.
    ```shell
    yarn install
    ```

5. Start the development server.
    ```shell
    yarn dev
    ```

## Files

- [lib/uauth.ts](./src/lib/uauth.ts) - The configuration for `@uauth/js`.
- [routes/index.svelte](./src/routes/index.svelte) - A login page implementation.