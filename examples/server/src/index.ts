import {Client} from '@uauth/node'
import Resolution from '@unstoppabledomains/resolution'
import express from 'express'
import 'express-async-errors'
import session from 'express-session'
import morgan from 'morgan'
import 'whatwg-fetch'
;(global as any).XMLHttpRequest = require('xhr2') as any
;(global as any).XMLHttpRequestUpload = (
  (global as any).XMLHttpRequest as any
).XMLHttpRequestUpload

const resolution = new Resolution()

const client = new Client({
  clientID: '1421c29a-cf20-4a5c-a6fa-65fbcc8c6151',
  redirectUri: 'http://localhost:5000',
  resolution,
})

const app = express()

app.use(morgan('dev'))

app.get('/', (_, res) => {
  const indexPage = `<!DOCTYPE html><html><body>
<form action="/login" method="POST">
  <input name="login_hint" id="login_hint" />
  <button type="submit">Login</button>
</form></body></html>`

  return res.send(indexPage)
})

// Required for express session middleware
app.use(session({secret: 'keyboard cat'}))

// Required for /login & /callback
app.use(express.urlencoded({extended: true}))

const {login, callback, middleware} = client.createExpressSessionLogin()

app.post('/login', (req, res, next) => {
  return login(req, res, next, {
    username: req.body.login_hint,
  })
})

app.post('/callback', async (req, res, next) => {
  console.log('Calling back!')

  await callback(req, res, next)

  return res.redirect('/profile')
})

const onlyAuthorized = middleware()

app.get('/profile', onlyAuthorized, async (req, res) => {
  res.json(res.locals.uauth)
})

app.listen(5000, () => {
  console.log('Listening at http://localhost:5000')
})
