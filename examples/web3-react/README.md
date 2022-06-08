# Web3-React Example

This is an example project demonstrating the use of [`@uauth/web3-react`](../../packages/web3-react/)

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. Copy the `clientID` from your **Client Metadata** and set the `redirectURI` to `http://localhost:5000/callback` in the `Uauth` constructor options in `index.tsx`.

3. Build your local copy of the `uauth` repo.
    ```sh
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/web3-react` package to the project.
    ```sh
    # Inside this project folder
    yarn add @uauth/web3-react
    ```
    
4. Install the project dependencies.
    ```sh
    yarn install
    ```

6. Start the development server.
    ```sh
    yarn start
    ```

## Files

- [index.tsx](./src/index.tsx) - The root of the React app.
- [connectors.ts](./src/connectors.ts) - The configuration for `web3-react`.
- [App.tsx](./src/App.tsx) - A login page implementation.

## Integration Guides

For step-by-step instructions for integrating with `@uath/web3-react`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [Web3 React](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/web3-react-guide/) integration guide.
