# @uauth/node

## Installation

```
yarn add @uauth/node @unstoppabledomains/resolution
```

## Setup

```typescript
import {Client} from '@uauth/node'
import Resolution from '@unstoppabledomains/resolution'

// This package requires a fetch polyfill for now.

import 'whatwg-fetch'

global.XMLHttpRequest = require('xhr2')
global.XMLHttpRequestUpload = (
  global.XMLHttpRequest as any
).XMLHttpRequestUpload

// Done polyfilling fetch.

const client = new Client({
  clientID: 'uauth_example_spa_id',
  clientSecret: 'uauth_example_spa_secret',
  redirectUri: 'http://localhost:5000/callback',
  scope: 'openid email wallet'
  resolution: new Resolution(),
})
```

### Methods

Because there are a variety of ways to store session data about a user, the package comes with a way to specify in an abstract way the 3 methods required to authorize and keep a user session.

##### `login(ctx: Context, options: {username: string}): Promise<void>`

1. Takes a username and generates an interaction object, saves it to a session.
2. Queries the blockchain to find if an auth server has been configured otherwise uses fallback.
3. Redirects the user to the auth server with a OIDC compliant authorization request.
4. After every authorization attempt the server will redirect the user to the `redirectUri` specified at instanciation.

#### `callback(ctx: Context): Promise<Authorization>`

1. Parses authorization code found in current uri.
2. Exchanges authorization code for access and id tokens.
3. Stores authorization (id and access tokens) inside session.

#### `middleware(): (ctx: Context) => void`

1. The authorization inside the session is attached to the context then passed to the next handler.

#### `client.createLogin<Context>()`

This is the login factory method. Here is an example using `express-sessions`.

```typescript
interface ExpressSessionContext {
  req: Request
  res: Response
  next: NextFunction
}

const {login, callback, middleware} = client.createLogin<ExpressSessionContext>(
  {
    // Interaction CR*D operations
    storeInteraction: (ctx, interaction) => {
      ctx.req.session.interaction = interaction
    },
    retrieveInteraction: ctx => ctx.req.session.interaction,
    deleteInteraction: ctx => {
      delete ctx.req.session.interaction
    },

    // Authorization CR*D operations
    storeAuthorization: (ctx, authorization) => {
      ctx.req.session.uauth = uauth
    },
    retrieveAuthorization: ctx => ctx.req.session.uauth,
    deleteAuthorization: ctx => {
      delete ctx.req.session.uauth
    },

    // Takes the context and returns authorization response as an `Object`.
    retrieveAuthorizationEndpointResponse: ctx => ctx.req.body,

    // Attaches the authorization to context and calls next.
    passOnAuthorization: (ctx, authorization) => {
      ctx.res.locals.uauth = authorization
      return ctx.next()
    },

    // Redirects user to different url.
    redirect: (ctx, url) => {
      ctx.res.redirect(url)
    },
  },
)
```

A snippet inside an example Express application using the functions generated above.

```typescript
app.use(session({secret: 'keyboard cat'}))
app.use(express.urlencoded({extended: true}))

app.get('/login', (req, res, next) => {
  return login(
    {req, res, next},
    {
      username: req.query.login_hint,
    },
  )
})

// The response_mode of the request is always 'form_post'
app.post('/callback', async (req, res, next) => {
  await callback({req, res, next})

  return res.redirect('/profile')
})

const onlyAuthorized = (req, res, next) => middleware()({req, res, next})

// IMPORTANT!: This is for example purposes only, you do not want the front-end to recieve to the full access_token.
app.get('/profile', onlyAuthorized, async (req, res) => {
  return res.json(res.locals.uauth)
})
```
