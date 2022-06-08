# Next.js Example

This is an example project demonstrating a simple Login with Unstoppable application with `@uauth/js` and `next`.

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. Set `NEXT_PUBLIC_CLIENT_ID` in the project's `.env` file to the `clientID` from your **Client Metadata**.

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

## Resources

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [The Next.js GitHub repository](https://github.com/vercel/next.js/)
