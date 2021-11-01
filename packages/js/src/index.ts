/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Authorization,
  AuthorizationCodeTokenEndpointRequest,
  AuthorizationEndpointRequest,
  AuthorizationEndpointResponse,
  Cache,
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  DomainResolver,
  IdToken,
  IssuerResolver,
  LogoutEndpointRequest,
  ResponseMode,
  ResponseType,
  StorageCache,
  TokenEndpointResponse,
  UserInfo,
} from '@uauth/common'
import * as modal from '@uauth/modal'
import {Resolution} from '@unstoppabledomains/resolution'
import {
  generateCodeChallengeAndVerifier,
  getRandomBytes,
  getSortedScope,
  getWindow,
  recordCacheKey,
  textEncoder,
  toUrlEncodedBase64,
} from './util'
import verifyIdToken from './verifyIdToken'

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
interface UAuthCacheOptions {
  issuer?: boolean
  userinfo?: boolean
}

export interface UAuthOptions {
  fallbackIssuer: string // not required
  clientID: string
  clientSecret: string
  redirectUri: string // must be included unless you specify it per request
  postLogoutRedirectUri?: string // not required
  scope: string // Defaults to "openid"
  audience?: string // not required, maybe call it reference?
  responseType: ResponseType // must be included unless you specify it per request
  responseMode: ResponseMode // must be included unless you specify it per requese
  maxAge: number // not required
  clockSkew: number // Defaults to 60
  createIpfsUrl: (cid: string, path: string) => string
  resolution: DomainResolver
  cacheOptions: UAuthCacheOptions
  // TODO: Add resolution
  // resolution: Resolution
}

export type UAuthConstructorOptions = Optional<
  UAuthOptions,
  | 'fallbackIssuer'
  | 'scope'
  | 'responseType'
  | 'responseMode'
  | 'maxAge'
  | 'clockSkew'
  | 'resolution'
  | 'cacheOptions'
  | 'createIpfsUrl'
>

export interface LoginOptions<T = any> {
  username: string
  redirectUri?: string
  scope?: string
  audience?: string
  responseType?: ResponseType
  responseMode?: ResponseMode
  state?: T
  beforeRedirect?(
    options: Partial<LoginOptions<T>>,
    url: string,
  ): void | Promise<void>
}

export interface LoginCallbackOptions {
  url: string
}

export interface LoginCallbackResponse<T> {
  authorization: Authorization
  state?: T
}

export interface LogoutOptions<T> {
  username?: string
  audience?: string
  scope?: string
  postLogoutRedirectUri?: string
  state?: T
  beforeRedirect?(
    options: Partial<LoginOptions<T>>,
    url: string,
  ): void | Promise<void>
}

export interface LogoutCallbackOptions {
  url?: string
}

export interface LogoutCallbackResponse<T> {
  state?: T
}

export interface CachedAuthorizationOptions {
  sub?: string
  scope?: string
  audience?: string
}

export interface UserOptions extends CachedAuthorizationOptions {
  claims?: string[]
}

const CACHE_KEY_ISSUER = 'CACHE_KEY_ISSUER'
const CACHE_KEY_OPENID_CONFIGURATION = 'CACHE_KEY_OPENID_CONFIGURATION'
const CACHE_KEY_LAST_SUB = 'CACHE_KEY_LAST_SUB'
const CACHE_KEY_AUTHORIZE_REQUEST = 'CACHE_KEY_AUTHORIZE_REQUEST'
const CACHE_KEY_AUTHORIZATION = 'CACHE_KEY_AUTHORIZATION'
const CACHE_KEY_CODE_VERIFIER = 'CACHE_KEY_CODE_VERIFIER'
const CACHE_KEY_LAST_NONCE = 'CACHE_KEY_LAST_NONCE'
const CACHE_KEY_LAST_AUTHORIZATION = 'CACHE_KEY_LAST_AUTHORIZATION'

export default class UAuth {
  // static Wallets = Wallets
  public options: UAuthOptions
  public cache: Cache
  public issuerResolver: IssuerResolver

  constructor(options: UAuthConstructorOptions) {
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

    this.options = options as UAuthOptions
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

  formatEndpointUrl(
    endpoint: string,
    request: Record<string, string | undefined>,
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
          name: CACHE_KEY_OPENID_CONFIGURATION,
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
      name: CACHE_KEY_OPENID_CONFIGURATION,
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
      audience: options.audience || this.options.audience,
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

    const nonce = toUrlEncodedBase64(getRandomBytes(32))
    const state = `${toUrlEncodedBase64(getRandomBytes(32))}.${
      options.state === undefined
        ? ''
        : toUrlEncodedBase64(textEncoder.encode(JSON.stringify(options.state)))
    }`

    const codeChallengeMethod = 'S256'
    const {verifier, challenge} = await generateCodeChallengeAndVerifier(
      43,
      codeChallengeMethod,
    )
    await this.saveCodeVerifier(verifier, nonce)

    const request: AuthorizationEndpointRequest = {
      client_id: this.options.clientID,
      login_hint: options.username,
      code_challenge: challenge,
      code_challenge_method: codeChallengeMethod,
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

    return this.formatEndpointUrl(
      openidConfiguration.authorization_endpoint,
      request as any,
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

    getWindow().location.assign(url)
  }

  async loginCallback<T = undefined>(
    options: LoginCallbackOptions = {url: getWindow().location.href},
  ): Promise<LoginCallbackResponse<T>> {
    const url = new URL(options.url)

    const request: AuthorizationEndpointRequest =
      await this.getAuthorizeRequest()

    const authorizationResponse: AuthorizationEndpointResponse = {} as any

    if (request.response_mode === 'fragment') {
      new URLSearchParams(url.hash.substring(1)).forEach((v, k) => {
        console.log('hash:', k, v)
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
      throw new Error(
        (authorizationResponse as any).error +
          ': ' +
          (authorizationResponse as any).error_description,
      )
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

    const idToken: IdToken = await verifyIdToken(
      openidConfiguration.jwks_uri,
      openidConfiguration.jwks,
      tokenResponse.id_token!,
      request.nonce,
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
      audience: request.resource,
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

    return this.formatEndpointUrl(
      openidConfiguration.end_session_endpoint,
      request as any,
    )
  }

  async logout<T = undefined>(options: LogoutOptions<T> = {}): Promise<void> {
    const url = await this.buildLogoutUrl(options)

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(options, url)
    }

    getWindow().location.assign(url)
  }

  // TODO: Check state after logout to make sure that the auth server wasn't man in the middled
  async logoutCallback<T = undefined>(
    options: LogoutCallbackOptions = {url: getWindow().location.href},
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
}
