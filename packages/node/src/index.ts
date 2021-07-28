import cors from 'cors'
import crypto, {randomBytes} from 'crypto'
import express, {RequestHandler} from 'express'
import 'express-async-errors'
import session from 'express-session'
import {
  AuthorizationParameters,
  CallbackParamsType,
  Issuer as OIDCIssuer,
} from 'openid-client'
import QueryString from 'qs'
import resolveDomain from '../../../auth/client/utils/resolveDomain'
import findJWKS from './findJWKS'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true},
  }),
)

interface LoginRequest {
  domain: string
}

const code_verifier = randomBytes(32).toString('hex')
const code_challenge = crypto
  .createHash('sha256')
  .update(code_verifier)
  .digest('base64')
// const nonce = randomBytes(32).toString('base64')
const loginEndpoint: RequestHandler<null, null, LoginRequest> = async (
  req,
  res,
) => {
  if ((req as any).session.sub) {
    res.redirect('/secret')
  }

  const {issuer: issuerUrl} = await resolveDomain(req.body.domain)

  const issuer = await OIDCIssuer.discover(issuerUrl)

  const client = new issuer.Client({
    client_id: 'authorization_code_test_client',
    client_secret: 'authorization_code_test_client_secret',
    redirect_uris: ['http://localhost:8081/callback'],
    response_types: ['code'],
  })

  const authReq: AuthorizationParameters = {
    login_hint: req.body.domain,
    // nonce,
    redirect_uri: 'http://localhost:8081/callback',
    scope: 'openid',
    // code_challenge,
    // code_challenge_method: 'S256',
  }

  // const par = await client.pushedAuthorizationRequest(authReq)

  return res.redirect(client.authorizationUrl(authReq))
}

interface CallbackRequest {
  // authorization_code
  code: string

  // If an error occurs
  error: string
  error_description: string
  error_uri: string
}

let token: any = {}

const callbackEndpoint: RequestHandler<null, any, null, CallbackRequest> =
  async (req, res, next) => {
    if (req.query.error) {
      console.error(req.query)

      return res.redirect(
        '/error?' +
          QueryString.stringify({
            error: req.query.error,
            error_description: req.query.error_description,
            error_uri: req.query.error_uri,
          }),
      )
    }

    const issuer = await OIDCIssuer.discover('http://localhost:8080')

    const client = new issuer.Client({
      client_id: 'authorization_code_test_client',
      client_secret: 'authorization_code_test_client_secret',
      redirect_uris: ['http://localhost:8081/callback'],
      response_types: ['code'],
      jwks: findJWKS('private'),
    })

    const cbReq: CallbackParamsType = {
      code: req.query.code,
      client_id: 'authorization_code_test_client',
      client_secret: 'authorization_code_test_client_secret',
      // nonce,
    }

    await new Promise(r => setTimeout(r, 1000))

    token = await client.callback('http://localhost:8081/callback', cbReq)

    console.log('access_token:', token)

    return res.redirect('/secret')
  }

const loginHTML = `
<!DOCTYPE html>
<html>
<body>

<h1>Login</h1>

<form action="/login" method="POST">
  <div>
    <label for="domain">Domain:</label>
    <input type="text" name="domain"/>
  </div>
  <button type="submit">Submit</button>
</form>

</body>
</html>`

app.get('/', (req, res, next) => {
  res.send(loginHTML)
})
app.post('/login', loginEndpoint)
app.get('/callback', callbackEndpoint)
app.get('/error', (req, res, next) => {
  res.json(req.query)
})

app.get('/secret', async (req, res) => {
  const issuer = await OIDCIssuer.discover('http://localhost:8080')

  const client = new issuer.Client({
    client_id: 'authorization_code_test_client',
    client_secret: 'authorization_code_test_client_secret',
    redirect_uris: ['http://localhost:8081/callback'],
    response_types: ['code'],
    jwks: findJWKS('private'),
  })

  res.json(await client.introspect(token.access_token!, 'access_token'))
})

app.listen(8081, () => {
  console.log('http://localhost:8081')
})
