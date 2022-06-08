# UAuth Developer Demo

This is a simple `create-react-app` demo of a `uauth` integration using the `@uauth/js` package. If you've never heard of create react app you can learn more [here](https://create-react-app.dev).

The entire demo project is contained and anotated inside the `src/index.tsx` file.

## Running this Project

1. Add `localhost:5000/callback` to your [Login Client](https://dashboard.auth.unstoppabledomains.com/) **Redirect URIs**.

2. In the `Uauth` constructor options in `index.tsx`, set the `clientID` to the `clientID` from your **Client Metadata** and set the `redirectURI` to `http://localhost:5000/callback`.
    
3. Build your local copy of the `uauth` repo.
    ```sh
    # From the top level of the uauth repo
    yarn install
    yarn build
    ```    
    Or add a live version of the `@uauth/js` package to the project.
    ```sh
    # Inside this project folder
    yarn add @uauth/js
    ```

4. Install the project dependencies.
    ```sh
    yarn install
    ```

5. Start the development server.
    ```sh
    yarn start
    ```