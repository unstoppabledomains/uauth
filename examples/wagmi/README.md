# Web3 Wagmi Example

This is an example project demonstrating the use of [`@uauth/wagmi`](../../packages/wagmi/)

## Running this Project

1. Build your local `uauth` packages.
    ```shell
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/wagmi` package to this project.
    ```shell
    # Inside this project folder
    yarn add @uauth/js @uauth/wagmi
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

- [CustomButton.tsx](./src/components/CustomButton.tsx) - An example wagmi custom button that incorporates the wagmi uath connector
- [index.tsx](./src/index.tsx) - The root of the React app.
- [App.tsx](./src/App.tsx) - A login page implementation.

## Integration Guides

For step-by-step instructions for integrating with `@uauth/wagmi`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/)
