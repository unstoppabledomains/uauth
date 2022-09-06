# Moralis Example

This is an example project demonstrating the use of [`@uauth/moralis`](../../packages/moralis/).

## Running this Project

1. Build your local `uauth` packages.
    ```shell
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/moralis` package to this project.
    ```shell
    # Inside this project folder
    yarn add @uauth/js @uauth/moralis
    ```

2. Install the project dependencies.
    ```shell
    yarn install
    ```
    
3. Start the development server.
    ```shell
    yarn start
    ```

## Files

- [index.tsx](./src/index.tsx) - The root of the React app.
- [connectors.ts](./src/connectors.ts) - The configuration for `moralis`.
- [App.tsx](./src/App.tsx) - A login page implementation.

## Integration Guides

For step-by-step instructions for integrating with `@uauth/moralis`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [Moralis](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/moralis-guide/) integration guide.

