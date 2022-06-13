# Blocknative Onboard Example

This is an example project demonstrating the use of [`@uauth/bnc-onboard`](../../packages/bnc-onboard/).

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. Set `REACT_APP_CLIENT_ID` in the project's `.env` file. to the `clientID` from your **Client Metadata**.

3. Build your local `uauth` packages.
    ```shell
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/bnc-onboard` package to this project.
    ```shell
    # Inside this project folder
    yarn add @uauth/bnc-onboard
    ```
    
4. Install the project dependencies.
    ```shell
    yarn install
    ```

4. Start the development server.
    ```shell
    yarn start
    ```

## Integration Guides

For step-by-step instructions for integrating with `@uath/bnc-onboard`, see the [Login Integration Pathways](https://docs.unstoppabledomains.com/login-with-unstoppable/get-started-login/integration-pathways/) and the [BNC Onboard](https://docs.unstoppabledomains.com/login-with-unstoppable/login-integration-guides/bnc-onboard-guide/) integration guide.
