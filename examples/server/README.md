# Node Server Example

This is an example project demonstrating the use of [`@uauth/node`](../../packages/web3-react/).

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. Copy the `clientID` from your **Client Metadata** to the `Client` constructor options in `index.ts`.

3. Build your local copy of the `uauth` repo.
    ```sh
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/node` package to the project.
    ```sh
    # Inside this project folder
    yarn add @uauth/node
    ```
    
4. Install the project dependencies.
    ```sh
    yarn install
    ```

6. Start the development server.
    ```sh
    yarn start
    ```

## Integration Guides

For step-by-step instructions for integrating with `@uath/web3-react`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [Node.js Server](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/node-js-server-guide/) integration guide.
