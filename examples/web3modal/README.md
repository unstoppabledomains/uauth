# Web3 Modal Example

This is an example project demonstrating the use of [`@uauth/web3modal`](../../packages/web3modal/)

## Running this Project

1. Build your local `uauth` packages.
    ```shell
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/web3modal` package to this project.
    ```shell
    # Inside this project folder
    yarn add @uauth/js @uauth/web3modal
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

- [Web3ModalContext.tsx](./src/Web3ModalContext.tsx) - An example context implementation to enable easy authentication with Web3 Modal and UAuth.
- [index.tsx](./src/index.tsx) - The root of the React app.
- [providerOptions.ts](./src/providerOptions.ts) - The configuration for `web3modal`.
- [App.tsx](./src/App.tsx) - A login page implementation.

## Integration Guides

For step-by-step instructions for integrating with `@uauth/web3modal`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [Web3 Modal](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/web3-modal-guide/) integration guide.
