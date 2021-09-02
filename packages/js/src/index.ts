/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Cache,
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  IssuerResolver,
  StorageCache,
} from '@uauth/common'
import * as modal from '@uauth/modal'
import {Resolution} from '@unstoppabledomains/resolution'
// TODO: figure out why these jose modules cannot be imported 'normally'.
// @ts-ignore
import {parseJwk} from 'jose/dist/browser/jwk/parse'
// @ts-ignore
import {createRemoteJWKSet} from 'jose/dist/browser/jwks/remote'
// @ts-ignore
import {jwtVerify} from 'jose/dist/browser/jwt/verify'
import {collapseTextChangeRangesAcrossMultipleVersions} from 'typescript'
import {
  AuthorizationCodeTokenEndpointRequest,
  AuthorizationEndpointRequest,
  AuthorizationEndpointResponse,
  CachedAuthorizationOptions,
  LoginCallbackOptions,
  LoginCallbackResponse,
  LoginOptions,
  LogoutCallbackOptions,
  LogoutEndpointRequest,
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

const CACHE_KEY_ISSUER = 'CACHE_KEY_ISSUER'
const CACHE_KEY_OPENID_CONFIGURATION = 'CACHE_KEY_OPENID_CONFIGURATION'
const CACHE_KEY_LAST_SUB = 'CACHE_KEY_LAST_SUB'
const CACHE_KEY_AUTHORIZE_REQUEST = 'CACHE_KEY_AUTHORIZE_REQUEST'
const CACHE_KEY_AUTHORIZATION = 'CACHE_KEY_AUTHORIZATION'
const CACHE_KEY_CODE_VERIFIER = 'CACHE_KEY_CODE_VERIFIER'
const CACHE_KEY_LAST_NONCE = 'CACHE_KEY_LAST_NONCE'
const CACHE_KEY_LAST_AUTHORIZATION = 'CACHE_KEY_LAST_AUTHORIZATION'

export default class UAuth implements SDK {
  // static Wallets = Wallets
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

    options.cacheOptions = {
      issuer: true,
      userinfo: true,
      ...options.cacheOptions,
    }

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
          records(
            domain: string,
            keys: string[],
          ): Promise<Record<string, string>> {
            return self.options.resolution.records(domain, keys)
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

  formatLogoutEndpointUrl(
    endpoint: string,
    request: LogoutEndpointRequest,
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

  async getOpenidConfiguration(username: string): Promise<any> {
    const issuerKey = recordCacheKey({name: CACHE_KEY_ISSUER, username})
    if (this.options.cacheOptions.issuer) {
      const issuer = await this.cache.get(issuerKey)
      if (issuer) {
        const openidConfigurationKey = recordCacheKey({
          name: 'openid-configuration',
          issuer,
        })

        const openidConfigurationRaw = await this.cache.get(
          openidConfigurationKey,
        )

        // TODO: Change to an isValid check.
        if (openidConfigurationRaw) {
          return JSON.parse(openidConfigurationRaw)
        }
      }
    }

    const openidConfiguration = await this.issuerResolver.resolve(
      username,
      this.options.fallbackIssuer,
    )

    await this.cache.set(issuerKey, openidConfiguration.issuer)

    const openidConfigurationKey = recordCacheKey({
      name: 'openid-configuration',
      issuer: openidConfiguration.issuer,
    })

    await this.cache.set(
      openidConfigurationKey,
      JSON.stringify(openidConfiguration),
    )

    return openidConfiguration
  }

  async saveCodeVerifier(verifier: string, nonce: string): Promise<void> {
    await this.cache.set(
      recordCacheKey({name: CACHE_KEY_CODE_VERIFIER, nonce}),
      verifier,
    )
  }

  async getCodeVerifier(nonce: string): Promise<string> {
    const verifier = await this.cache.get(
      recordCacheKey({name: CACHE_KEY_CODE_VERIFIER, nonce}),
    )

    if (!verifier) {
      throw new Error('failed to get verifier')
    }

    return verifier
  }

  async saveAuthorizeRequest(
    request: AuthorizationEndpointRequest,
  ): Promise<void> {
    await this.cache.set(CACHE_KEY_LAST_NONCE, request.nonce)
    await this.cache.set(
      recordCacheKey({name: CACHE_KEY_AUTHORIZE_REQUEST, nonce: request.nonce}),
      JSON.stringify(request),
    )
  }

  async getAuthorizeRequest(
    nonce?: string,
  ): Promise<AuthorizationEndpointRequest> {
    if (nonce) {
      const authorizeRequestRaw = await this.cache.get(
        recordCacheKey({name: CACHE_KEY_AUTHORIZE_REQUEST, nonce}),
      )

      if (authorizeRequestRaw) {
        return JSON.parse(authorizeRequestRaw)
      }
    }

    const lastNonce = await this.cache.get(CACHE_KEY_LAST_NONCE)
    if (!lastNonce) {
      throw new Error('cannot find authorization request')
    }

    const authorizeRequestRaw = await this.cache.get(
      recordCacheKey({name: CACHE_KEY_AUTHORIZE_REQUEST, nonce: lastNonce}),
    )

    if (!authorizeRequestRaw) {
      throw new Error('cannot find authorization request')
    }

    return JSON.parse(authorizeRequestRaw)
  }

  async saveAuthorization(authorization: Authorization): Promise<void> {
    const key = recordCacheKey({
      name: CACHE_KEY_AUTHORIZATION,
      client_id: this.options.clientID,
      sub: authorization.idToken.sub,
      scope: authorization.scope,
      audience: authorization.audience,
    })
    await this.cache.set(CACHE_KEY_LAST_AUTHORIZATION, key)
    await this.cache.set(CACHE_KEY_LAST_SUB, authorization.idToken.sub)
    await this.cache.set(key, JSON.stringify(authorization))
  }

  private async getCachedAuthorization(
    options: CachedAuthorizationOptions,
  ): Promise<Authorization> {
    const sub = options.sub || (await this.cache.get(CACHE_KEY_LAST_SUB))
    if (!sub) {
      throw new Error('no sub')
    }

    const authorizationKey = recordCacheKey({
      name: CACHE_KEY_AUTHORIZATION,
      client_id: this.options.clientID,
      sub,
      scope: getSortedScope(options.scope || this.options.scope),
      audience: options.audience || this.options.audience || 'default',
    })

    const authorizationRaw = await this.cache.get(authorizationKey)

    if (!authorizationRaw) {
      throw new Error('no authorization')
    }

    const authorization = JSON.parse(authorizationRaw)

    if (authorization.expiresAt < Date.now()) {
      throw new Error('Token has expired')
    }

    return authorization
  }

  async buildLoginUrl<T = undefined>(
    options: LoginOptions<T>,
  ): Promise<string> {
    const openidConfiguration = await this.getOpenidConfiguration(
      options.username,
    )

    if (!openidConfiguration.authorization_endpoint) {
      throw new Error('no authorization_endpoint')
    }

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
    await this.saveCodeVerifier(verifier, nonce)

    const request: AuthorizationEndpointRequest = {
      client_id: this.options.clientID,
      login_hint: options.username,
      code_challenge: challenge,
      code_challenge_method: 'plain', // TODO: FIX
      nonce,
      state: state,
      max_age: this.options.maxAge || 600,
      resource: options.audience || this.options.audience,
      redirect_uri: options.redirectUri || this.options.redirectUri,
      response_type: options.responseType || this.options.responseType,
      response_mode: options.responseMode || this.options.responseMode,
      scope: getSortedScope(options.scope || this.options.scope),
      prompt: 'login',
    }

    await this.saveAuthorizeRequest(request)

    return this.formatAuthorizationEndpointUrl(
      openidConfiguration.authorization_endpoint,
      request,
    )
  }

  async login(options: Partial<LoginOptions> = {}): Promise<void> {
    let url: string
    if (options.username) {
      url = await this.buildLoginUrl(options as any)
    } else {
      url = await modal.open(domain =>
        this.buildLoginUrl({...options, username: domain}),
      )
    }

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(options, url)
    }

    window.location.assign(url)
  }

  async loginCallback<T = undefined>(
    options: LoginCallbackOptions = {url: window.location.href},
  ): Promise<LoginCallbackResponse<T>> {
    const url = new URL(options.url)

    const request: AuthorizationEndpointRequest =
      await this.getAuthorizeRequest()

    const authorizationResponse: AuthorizationEndpointResponse = {} as any

    if (request.response_mode === 'fragment') {
      new URLSearchParams(url.hash.substring(1)).forEach((v, k) => {
        authorizationResponse[k] = v
      })
    } else if (request.response_mode === 'query') {
      new URLSearchParams(url.search).forEach((v, k) => {
        authorizationResponse[k] = v
      })
    } else {
      throw new Error('only fragment & query response_mode supported for now')
    }

    if ((authorizationResponse as any).error) {
      throw new Error('bad request')
    }

    if (authorizationResponse.state !== request.state) {
      throw new Error("state returned doesn't match state in cache")
    }

    const openidConfiguration = await this.getOpenidConfiguration(
      request.login_hint,
    )

    const codeVerifier = await this.getCodeVerifier(request.nonce)

    const tokenRequest: AuthorizationCodeTokenEndpointRequest = {
      client_id: this.options.clientID,
      client_secret: this.options.clientSecret,
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

    // TODO: The server isn't returning the scope along with the callback and I havn't found the oidc docs to figure out if this is a bug.
    const scope = getSortedScope(request.scope)
    const accessToken = tokenResponse.access_token
    // toBase64(textEncoder.encode(idToken.sub + ':' + tokenResponse.access_token))

    const authorization: Authorization = {
      accessToken,
      expiresAt,
      idToken,
      scope,
      audience: request.resource || 'default',
    }
    await this.saveAuthorization(authorization)

    return {
      authorization,
      state: JSON.parse(request.state!.split('.', 1)[1] || (null as any)),
    }
  }

  async buildLogoutUrl<T = undefined>(
    options: LogoutOptions<T>,
  ): Promise<string> {
    const authorization = await this.getCachedAuthorization({
      sub: options.username,
      audience: options.audience,
      scope: options.scope,
    })
    if (!authorization) {
      throw new Error('no authorization')
    }

    const authorizationKey = recordCacheKey({
      name: CACHE_KEY_AUTHORIZATION,
      client_id: this.options.clientID,
      sub: authorization.idToken.sub,
      scope: authorization.scope,
      audience: authorization.audience,
    })
    await this.cache.delete(authorizationKey)

    const openidConfiguration = await this.getOpenidConfiguration(
      authorization.idToken.sub,
    )
    if (!openidConfiguration.end_session_endpoint) {
      throw new Error('no logout endpoint')
    }

    const postLogoutRedirectUri =
      options.postLogoutRedirectUri || this.options.postLogoutRedirectUri
    if (!postLogoutRedirectUri) {
      throw new Error('cannot logout from server')
    }

    const request: LogoutEndpointRequest = {
      id_token_hint: authorization.idToken.__raw,
      post_logout_redirect_uri: postLogoutRedirectUri,
      state: '',
    }

    return this.formatLogoutEndpointUrl(
      openidConfiguration.end_session_endpoint,
      request,
    )
  }

  async logout<T = undefined>(options: LogoutOptions<T> = {}): Promise<void> {
    const url = await this.buildLogoutUrl(options)

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(options, url)
    }

    window.location.assign(url)
  }

  // TODO: Check state after logout to make sure that the auth server wasn't man in the middled
  async logoutCallback<T = undefined>(
    options: LogoutCallbackOptions = {url: window.location.href},
  ): Promise<T> {
    const t: T = null as any
    return t
  }

  async user(options: UserOptions = {}): Promise<UserInfo> {
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
      'example',
      'wallet_address',
      'wallet_type_hint',
    ]

    const authorization = await this.getCachedAuthorization(options)
    if (!authorization) {
      throw new Error('no authorization')
    }

    if (this.options.cacheOptions.userinfo) {
      const userinfo: UserInfo = {
        sub: authorization.idToken.sub,
      }

      for (const claim of claims) {
        if (authorization.idToken[claim]) {
          userinfo[claim] = authorization.idToken[claim]
        }
      }

      return userinfo
    }

    const sub = options.sub || (await this.cache.get(CACHE_KEY_LAST_SUB))
    if (!sub) {
      throw new Error('no sub')
    }

    const openidConfiguration = await this.getOpenidConfiguration(sub)

    const userinfoResponse: any = await fetch(
      openidConfiguration.userinfo_endpoint,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authorization.accessToken}`,
        },
      },
    ).then(async resp =>
      resp.ok ? resp.json() : Promise.reject(await resp.json()),
    )

    const userinfo: UserInfo = {
      sub,
    }

    for (const claim of claims) {
      if (userinfoResponse[claim]) {
        userinfo[claim] = userinfoResponse[claim]
      }
    }

    return userinfo
  }

  async verifyIdToken(
    request: AuthorizationEndpointRequest,
    id_token: string,
  ): Promise<IdToken> {
    const openidConfiguration = await this.getOpenidConfiguration(
      request.login_hint,
    )

    const jwt = await jwtVerify(
      id_token!,
      openidConfiguration.jwks
        ? await parseJwk(openidConfiguration.jwks)
        : createRemoteJWKSet(new URL(openidConfiguration.jwks_uri)),
    )

    const idToken: IdToken = jwt.payload

    idToken.__raw = id_token

    if (request.nonce !== idToken.nonce) {
      throw new Error("nonces don't match")
    }

    return idToken
  }

  /*  async connectPreferedWallet(
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
  } */

  /* async preferedWallet(
    domain: string,
    user: string,
  ): Promise<{
    addr: string
    addr_type_hint: string
  }> {
    const authenticationKey = `authentication.${user}`


    const {[authenticationKey]: authenticationRecord} =
      await this.options.resolution.records(domain, [authenticationKey])


    const authentication = JSON.parse(authenticationRecord)

    if (!authentication.addr || !authentication.addr_type_hint) {
      throw new Error('no preferedWallet available')
    }

    return authentication
  } */
}
