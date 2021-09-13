import UAuth from '../../packages/js/src'

/**
 * Instanciation
 *
 * @param options
 *
 * @param options.clientID: string
 * TODO: param options.clientSecret?: We don't have it, but we probably will once we deploy more than the one UAuth server
 * @param options.redirectUri: string // must be included unless you specify it per request
 * @param options.scope: string // Defaults to "openid"
 * @param options.fallbackIssuer: string // not required, defaults to https://auth.unstoppabledomains.com
 * @param options.postLogoutRedirectUri?: string // not required
 * @param options.audience?: string // not required, maybe call it resource?
 * @param options.responseType: ResponseType
 * @param options.responseMode: ResponseMode
 * @param options.maxAge: number // not required
 * @param options.clockSkew: number // Defaults to 60
 * @param options.networks?: NetworkConfig[] // TODO
 * @param options.createIpfsUrl?: (cid: string, path: string) => string
 * @param options.resolution: DomainResolver
 */
const uauth = new UAuth({
  clientID: 'my_client_id',
  clientSecret: 'my_client_secret',
  redirectUri: 'https://my-client.com/callback',
  scope: 'openid email wallet', // Defaults to 'openid' which just giving access to the the domain name
  // resolution: Optional existing resolution library instance
})

/**
 * Login
 *
 * Redirects browser to authorization server. Should be placed on a button.
 *
 * @param options
 *
 * @param options.username: string // if unspecified a modal will appear and prompt you for a domain.
 * @param options.redirectUri?: string // required either in constructor or here
 * @param options.scope?: string // required either in constructor or here
 * @param options.audience?: string
 * @param options.responseType?: ResponseType
 * @param options.responseMode?: ResponseMode
 * @param options.state?: T
 * @param options.beforeRedirect?(options, url: string): void | Promise<void>
 */
uauth.login().catch(error => {
  // some error occured
})

/**
 * Login Callback
 *
 * Uses the window.location in conjuction with variables left in local storage to
 * take the authorization code and exchange it for an access token.
 *
 * @param options
 *
 * @param options.url: string // if unspecified a will default to window.location.href
 */
uauth
  .loginCallback()
  .then(user => {
    console.log(user)
    // user.wallet_type_hint
  })
  .catch(error => {
    // some error occured
  })

/**
 * Access User info
 *
 * Returns relavent cached values of access & id tokens in localstorage
 */
uauth
  .user()
  .then(user => {
    console.log(user)
  })
  .catch(error => {
    window.location.assign('/login')
    // some error occured while trying to fetch user information, apps should probably log back in
  })

/**
 * Logout
 *
 * @param options?
 *
 * @param options.postLogoutRedirectUri?: string
 * @param options.state?: T
 * @param options.beforeRedirect?(options,url: string): void | Promise<void>
 */
// Needs polishing
uauth.logout().catch(error => {
  // some error occured
})

/**
 * TODO: more validation
 *
 * @param options
 *
 * @param options.url: string // if unspecified a will default to window.location.href
 */
uauth.logoutCallback().catch(error => {
  // some error occured
})

// {
//   sub: "domain.crypto",
//   email: "user@gmail.com",
//   email_verified: false,
//   wallet_address: '0xb8E77cfF40f2942290C2213505Eb2dE733FAcf4C',
//   wallet_type_hint: 'web3' | 'walletconnect'
// }
