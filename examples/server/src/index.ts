import express from 'express'
import session from 'express-session'
import {Client} from '@uauth/node'
import Resolution from '@unstoppabledomains/resolution'
import 'whatwg-fetch'

global.XMLHttpRequest = require('xhr2')
global.XMLHttpRequestUpload = (
  global.XMLHttpRequest as any
).XMLHttpRequestUpload

const resolution = new Resolution()

const client = new Client({
  clientID: 'uauth_example_spa_id',
  clientSecret: 'uauth_example_spa_secret',
  redirectUri: 'http://localhost:5000/callback',
  resolution,
})

const app = express()

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
  await callback(req, res, next)

  return res.redirect('/profile')
})

const onlyAuthorized = middleware()

app.get('/profile', onlyAuthorized, async (req, res) => {
  res.send(
    `<!DOCTYPE html><html><body><pre>${JSON.stringify(
      res.locals.uauth,
    )}</pre></body></html>`,
  )
})

app.listen(5000, () => {
  console.log('Listening at http://localhost:5000')
})
