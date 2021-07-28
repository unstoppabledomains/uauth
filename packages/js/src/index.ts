/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Resolution} from '@unstoppabledomains/resolution'
// TODO: figure out why these jose modules cannot be imported 'normally'.
import {parseJwk} from 'jose/dist/browser/jwk/parse'
import {createRemoteJWKSet} from 'jose/dist/browser/jwks/remote'
import {jwtVerify} from 'jose/dist/browser/jwt/verify'
import {
  Cache,
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  IssuerResolver,
  StorageCache,
} from '../../common/src'
import {
  AuthorizationCodeTokenEndpointRequest,
  AuthorizationEndpointRequest,
  AuthorizationEndpointResponse,
  CachedAuthorizationOptions as CachedAuthorizationOptions,
  LoginCallbackOptions,
  LoginCallbackResponse,
  LoginOptions,
  LogoutCallbackOptions,
  LogoutOptions,
  SDK,
  SDKConstructorOptions,
  SDKOptions,
  TokenEndpointResponse,
  UserOptions,
} from './types'
import {Authorization, IdToken, UserInfo} from './types/custom'
import {
  generateCodeChallengeAndVerifier,
  getRandomBytes,
  textEncoder,
  toBase64,
} from './util/crypto'
import {getSortedScope, recordCacheKey} from './util/general'
import * as Wallets from './wallets'
import {BaseWallet} from './wallets'

export default class UAuth implements SDK {
  static Wallets = Wallets
  public options: SDKOptions
  public cache: Cache
  public issuerResolver: IssuerResolver

  constructor(options: SDKConstructorOptions) {
    // This should default to the auth server that Unstoppable runs
    options.fallbackIssuer =
      options.fallbackIssuer || 'https://auth.unstoppabledomains.com'
    options.scope = options.scope || 'openid'
    options.responseType = options.responseType || 'code'
    options.responseMode = options.responseMode || 'fragment'
    options.maxAge = options.maxAge || 600
    options.clockSkew = options.clockSkew || 60
    options.resolution = options.resolution || new Resolution()

    this.options = options as SDKOptions
    this.cache = new StorageCache()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this.issuerResolver = new DefaultIssuerResolver({
      webfingerResolver: new DefaultWebFingerResolver({
        ipfsResolver: new DefaultIPFSResolver((...args) =>
          (this.options.createIpfsUrl || DefaultIPFSResolver.defaultCreateUrl)(
            ...args,
          ),
        ),
        domainResolver: {
          get records() {
            return self.options.resolution.records
          },
        },
      }),
    })
  }

  formatAuthorizationEndpointUrl(
    endpoint: string,
    request: AuthorizationEndpointRequest,
  ): string {
    const url = new URL(endpoint)

    url.search = new URLSearchParams(
      Object.entries(request).reduce((a, [k, v]) => {
        if (k && v) {
          a.push([k, v])
        }
        return a
      }, [] as [string, string][]),
    ).toString()

    return url.toString()
  }

  async buildLoginUrl<T = undefined>(
    options: LoginOptions<T>,
  ): Promise<string> {
    const openidConfiguration = await this.issuerResolver.resolve(
      options.username,
    )

    if (!openidConfiguration.authorization_endpoint) {
      throw new Error('no authorization_endpoint')
    }

    await this.cache.set(
      'openid-configuration',
      JSON.stringify(openidConfiguration),
    )

    const nonce = Buffer.from(getRandomBytes(32)).toString('base64')

    const state = `${toBase64(getRandomBytes(32))}.${
      options.state === undefined
        ? ''
        : toBase64(textEncoder.encode(JSON.stringify(options.state)))
    }`

    const {verifier, challenge} = await generateCodeChallengeAndVerifier(
      43,
      'plain',
    )
    await this.cache.set('code_verifier', verifier)

    const request: AuthorizationEndpointRequest = {
      client_id: this.options.clientID,
      login_hint: options.username,
      code_challenge: challenge,
      code_challenge_method: 'plain', // TODO: FIX
      nonce: nonce,
      state: state,
      max_age: this.options.maxAge || 600,
      resource: options.audience || this.options.audience,
      redirect_uri: options.redirectUri || this.options.redirectUri,
      response_type: options.responseType || this.options.responseType,
      response_mode: options.responseMode || this.options.responseMode,
      scope: getSortedScope(options.scope || this.options.scope),
      prompt: 'login',
    }

    await this.cache.set('authorize_request', JSON.stringify(request))

    return this.formatAuthorizationEndpointUrl(
      openidConfiguration.authorization_endpoint,
      request,
    )
  }

  async login(options: LoginOptions): Promise<void> {
    const url = await this.buildLoginUrl(options)

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(options, url)
    }

    window.location.assign(url)
  }

  async loginCallback<T = undefined>(
    options: LoginCallbackOptions = {url: window.location.href},
  ): Promise<LoginCallbackResponse<T>> {
    const url = new URL(options.url)

    const request: AuthorizationEndpointRequest = JSON.parse(
      (await this.cache.get('authorize_request'))!,
    )

    const authorizationResponse: AuthorizationEndpointResponse = {} as any
    switch (request.response_mode) {
      case 'fragment': {
        new URLSearchParams(url.hash.substring(1)).forEach((v, k) => {
          authorizationResponse[k] = v
        })
        break
      }
      case 'query': {
        new URLSearchParams(url.search).forEach((v, k) => {
          authorizationResponse[k] = v
        })
        break
      }
      default:
        throw new Error('only fragment & query response_mode supported for now')
    }

    if ((authorizationResponse as any).error) {
      throw new Error('bad request')
    }

    if (authorizationResponse.state !== request.state) {
      throw new Error("state returned doesn't match state in cache")
    }

    const openidConfiguration = JSON.parse(
      (await this.cache.get('openid-configuration'))!,
    )
    const codeVerifier = (await this.cache.get('code_verifier'))!

    const tokenRequest: AuthorizationCodeTokenEndpointRequest = {
      client_id: this.options.clientID,
      client_secret: 'authorization_code_test_client_secret',
      code: authorizationResponse.code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: request.redirect_uri,
    }

    const tokenResponse: TokenEndpointResponse = await fetch(
      openidConfiguration.token_endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest),
      },
    ).then(async resp =>
      resp.ok ? resp.json() : Promise.reject(await resp.json()),
    )

    const idToken: IdToken = await this.verifyIdToken(
      request,
      tokenResponse.id_token!,
    )
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000

    console.log('tokenResponse:', tokenResponse)

    // TODO: The server isn't returning the scope along with the callback and I havn't found the oidc docs to figure out if this is a bug.
    const scope = getSortedScope(request.scope)
    const accessToken = toBase64(
      textEncoder.encode(idToken.sub + ':' + tokenResponse.access_token),
    )

    console.log('set recordCacheKey:', {
      name: 'authorization',
      client_id: this.options.clientID,
      sub: idToken.sub,
      scope,
      audience: this.options.audience || 'default',
    })

    await this.cache.set(
      recordCacheKey({
        name: 'authorization',
        client_id: this.options.clientID,
        sub: idToken.sub,
        scope,
        audience: this.options.audience || 'default',
      }),
      JSON.stringify({
        accessToken,
        expiresAt,
        idToken,
      }),
    )

    await this.cache.set('last-sub', idToken.sub)

    return {
      authorization: {
        accessToken,
        expiresAt,
        idToken,
      },
      state: JSON.parse(request.state!.split('.', 1)[1] || (null as any)),
    }
  }

  async buildLogoutUrl<T = undefined>(
    options: LogoutOptions<T>,
  ): Promise<string> {
    return ''
  }

  async logout<T = undefined>(options: LogoutOptions<T> = {}): Promise<void> {
    window.location.assign(await this.buildLogoutUrl(options))
  }

  async logoutCallback<T = undefined>(
    options: LogoutCallbackOptions,
  ): Promise<T> {
    const t: T = null as any
    return t
  }

  private async getCachedAuthorization(
    options: CachedAuthorizationOptions = {},
  ): Promise<Authorization> {
    const cachedSub = await this.cache.get('last-sub')

    console.log('get recordCacheKey:', {
      name: 'authorization',
      client_id: this.options.clientID,
      scope: getSortedScope(options.scope || this.options.scope),
      audience: options.audience || this.options.audience || 'default',
      sub: options.sub || cachedSub!,
    })

    const authorization = JSON.parse(
      (await this.cache.get(
        recordCacheKey({
          name: 'authorization',
          client_id: this.options.clientID,
          scope: getSortedScope(options.scope || this.options.scope),
          audience: options.audience || this.options.audience || 'default',
          sub: options.sub || cachedSub!,
        }),
      ))!,
    )

    if (authorization.expiresAt < Date.now()) {
      throw new Error('Token has expired')
    }

    return authorization
  }

  private async getAuthorizationUsingRefreshToken(): Promise<Authorization> {
    throw new Error('refresh tokens not supported for SPAs')
  }

  async getAuthorization(
    options: CachedAuthorizationOptions = {},
  ): Promise<Authorization> {
    const cachedAuthorization = await this.getCachedAuthorization(options)

    if (cachedAuthorization) {
      return cachedAuthorization
    }

    return this.getAuthorizationUsingRefreshToken()
  }

  async user(options: UserOptions = {}): Promise<UserInfo> {
    const authoirzation: Authorization = await this.getAuthorization(options)

    const userinfo: UserInfo = {
      sub: authoirzation.idToken.sub,
    }

    // Defaults to the standard claims
    const claims = options.claims || [
      'name',
      'given_name',
      'family_name',
      'middle_name',
      'nickname',
      'preferred_username',
      'profile',
      'picture',
      'website',
      'email',
      'email_verified',
      'gender',
      'birthdate',
      'zoneinfo',
      'locale',
      'phone_number',
      'phone_number_verified',
      'address',
      'updated_at',
    ]

    for (const claim of claims) {
      if (authoirzation.idToken[claim]) {
        userinfo[claim] = authoirzation.idToken[claim]
      }
    }

    return userinfo
  }

  async verifyIdToken(
    request: AuthorizationEndpointRequest,
    id_token: string,
  ): Promise<IdToken> {
    const openidConfiguration = JSON.parse(
      (await this.cache.get('openid-configuration'))!,
    )

    const jwt = await jwtVerify(
      id_token!,
      openidConfiguration.jwks
        ? await parseJwk(openidConfiguration.jwks)
        : createRemoteJWKSet(new URL(openidConfiguration.jwks_uri)),
    )

    const idToken: IdToken = jwt.payload

    if (request.nonce !== idToken.nonce) {
      throw new Error("nonces don't match")
    }

    return idToken
  }

  introspect(): void {
    return
  }

  async connectPreferedWallet(
    domain: string,
    user: string,
  ): Promise<BaseWallet> {
    const authentication = await this.preferedWallet(domain, user)

    if (!this.options.wallets) {
      throw new Error('no wallets configured')
    }

    if (!this.options.wallets[authentication.addr_type_hint]) {
      throw new Error('no wallets of that type configured')
    }

    const wallet = this.options.wallets[authentication.addr_type_hint](
      authentication.addr,
      authentication.addr_type_hint,
    )

    await wallet.connect()

    return wallet
  }

  async preferedWallet(
    domain: string,
    user: string,
  ): Promise<{
    addr: string
    addr_type_hint: string
  }> {
    const authenticationKey = `authentication.${user}`

    console.log('authenticationKey:', authenticationKey)

    const {[authenticationKey]: authenticationRecord} =
      await this.options.resolution.records(domain, [authenticationKey])

    console.log('authenticationRecord:', authenticationRecord)

    const authentication = JSON.parse(authenticationRecord)

    if (!authentication.addr || !authentication.addr_type_hint) {
      throw new Error('no preferedWallet available')
    }

    return authentication
  }
}
