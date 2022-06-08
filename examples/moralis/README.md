# Moralis Example

This is an example project demonstrating the use of [`@uauth/moralis`](../../packages/moralis/).

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs*.

2. Set `REACT_APP_CLIENT_ID` in the project's `.env` file. to the `clientID` from your **Client Metadata**.

3. Build your local `uauth` packages.
    ```sh
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/moralis` package to this project.
    ```sh
    # Inside this project folder
    yarn add @uauth/moralis
    ```

4. Install the project dependencies.
    ```yarn
    yarn install
    ```
    
4. Start the development server.
    ```shell
    yarn start
    ```

## Files

- [index.tsx](./src/index.tsx) - The root of the React app.
- [connectors.ts](./src/connectors.ts) - The configuration for `moralis`.
- [App.tsx](./src/App.tsx) - A login page implementation.

## Integration Guides

For step-by-step instructions for integrating with `@uath/moralis`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [Moralis](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/moralis-guide/) integration guide.

