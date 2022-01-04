import AbstractUI from '@uauth/abstract-ui'
import {
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  DomainResolver,
  IssuerResolver,
} from '@uauth/common'
import DomUI from '@uauth/dom-ui'
import Resolution, {
  ResolutionError,
  ResolutionErrorCode,
} from '@unstoppabledomains/resolution'
import {
  Api,
  AuthorizeRequest,
  AuthorizeResponse,
  LogoutRequest,
  LogoutResponse,
  PopupConfig,
  TokenResponse,
  TokenWithAuthorizationCodeRequest,
  UserInfoRequest,
} from './api'
import ClientStore from './ClientStore'
import {StorageStore, Store} from './store'
import {
  Authorization,
  AuthorizationOptions,
  BaseLoginOptions,
  BaseLogoutOptions,
  CacheOptions,
  ClientOptions,
  FullLoginOptions,
  LoginCallbackOptions,
  LoginCallbackResponse,
  LoginOptions,
  LogoutCallbackOptions,
  LogoutOptions,
  UserInfo,
  UserOptions,
} from './types'
import * as util from './util'

export default class Client {
  util = util
  store: Store
  private _clientStore = new ClientStore(this)
  api: Api
  fallbackIssuer: string
  fallbackLoginOptions: BaseLoginOptions
  fallbackLogoutOptions: BaseLogoutOptions
  cacheOptions: CacheOptions
  window: Window
  issuerResolver: IssuerResolver
  resolution: DomainResolver
  ui: AbstractUI<AuthorizeRequest>

  constructor(options: ClientOptions) {
    this.window! = options.window ?? window
    this.fallbackIssuer =
      options.fallbackIssuer ?? 'https://auth.unstoppabledomains.com'
    this.resolution = options.resolution ?? new Resolution()

    if (options.ui) {
      this.ui = options.ui
    } else {
      if (options.uiOptions) {
        this.ui = new DomUI(options.uiOptions)
      } else {
        this.ui = new DomUI()
      }
    }

    if (options.store) {
      this.store = options.store
    } else {
      const storeType = options.storeType ?? 'localstore'
      switch (storeType) {
        case 'localstore':
          this.store = new StorageStore(this.window.localStorage)
          break
        case 'sessionstore':
          this.store = new StorageStore(this.window.sessionStorage)
          break
        case 'memory':
          this.store = new Map<string, string>()
          break
        default:
          throw new Error('Bad storeType provided')
      }
    }

    this.cacheOptions = {
      issuer: false,
      userinfo: true,
      getDefaultUsername: () =>
        this.window.localStorage.getItem('uauth-default-username') ?? '',
      ...(options.cacheOptions ?? {}),
    }

    if (
      !options.cacheOptions?.getDefaultUsername &&
      !options.cacheOptions?.setDefaultUsername
    ) {
      this.cacheOptions.setDefaultUsername = (username: string) => {
        this.window.localStorage.setItem('uauth-default-username', username)
      }
    }

    this.api = new Api({
      headers: {},
      window: this.window,
    })

    this.fallbackLoginOptions = {
      clientID: options.clientID,
      clientSecret: options.clientSecret,
      clientAuthMethod:
        options.clientAuthMethod ??
        (options.clientSecret ? 'client_secret_post' : 'none'),
      maxAge: options.maxAge ?? 300000,
      prompt: options.prompt ?? 'login',
      resource: options.resource,
      redirectUri: options.redirectUri,
      responseMode: options.responseMode ?? 'fragment',
      scope: options.scope ?? 'openid wallet',
    }

    this.fallbackLogoutOptions = {
      rpInitiatedLogout:
        options.rpInitiatedLogout ??
        typeof options.postLogoutRedirectUri === 'string',
      postLogoutRedirectUri: options.postLogoutRedirectUri,
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this.issuerResolver = new DefaultIssuerResolver({
      webfingerResolver: new DefaultWebFingerResolver({
        ipfsResolver: new DefaultIPFSResolver((...args) =>
          (options.createIpfsUrl || DefaultIPFSResolver.defaultCreateUrl)(
            ...args,
          ),
        ),
        domainResolver: {
          async records(
            domain: string,
            keys: string[],
          ): Promise<Record<string, string>> {
            try {
              const records = await self.resolution.records(domain, keys)
              return records
            } catch (error) {
              if (
                error instanceof ResolutionError &&
                error.code === ResolutionErrorCode.UnspecifiedResolver
              ) {
                return {}
              }
              throw error
            }
          },
        },
      }),
    })
  }

  private _createAuthorizeRequestBuilder(
    options: Partial<LoginOptions>,
  ): (username: string) => Promise<AuthorizeRequest> {
    // TODO: Ensure nothing is missing
    const loginOptions: FullLoginOptions = {
      ...this.fallbackLoginOptions,
      ...options,
    } as FullLoginOptions

    const builder = async (username: string): Promise<AuthorizeRequest> => {
      await new Promise(r => setTimeout(r, 2000))
      const openidConfiguration = await this.getOpenIdConfiguration(username)

      const {verifier, challenge} =
        await util.crypto.createCodeChallengeAndVerifier(43, 'S256')

      const nonce = util.encoding.toBase64(
        util.encoding.stringFromBuffer(util.crypto.getRandomBytes(32)),

        /* util.encoding.textDecoder.decode */
      )

      const state = util.encoding.encodeState(loginOptions.state)

      const request: AuthorizeRequest = {
        // Generated options
        url: openidConfiguration.authorization_endpoint,
        code_challenge: challenge,
        nonce,
        state,

        // Parameterized options
        client_id: loginOptions.clientID,
        client_secret: loginOptions.clientSecret,
        client_auth_method: loginOptions.clientAuthMethod,
        login_hint: username,
        max_age: loginOptions.maxAge,
        prompt: loginOptions.prompt,
        resource: loginOptions.resource,
        redirect_uri: loginOptions.redirectUri,
        response_mode: loginOptions.responseMode,
        scope: loginOptions.scope,

        // Constant options
        code_challenge_method: 'S256',
        response_type: 'code',
      }

      await this._clientStore.setAuthorizeRequest(request)
      await this._clientStore.setVerifier(challenge, verifier)

      return request
    }

    return builder
  }

  async buildAuthorizeRequest(
    options: Partial<LoginOptions>,
  ): Promise<AuthorizeRequest> {
    const builder = this._createAuthorizeRequestBuilder(options)

    if (options.username) {
      return builder(options.username)
    }

    return this.ui.open({
      closeOnFinish: false,
      defaultValue: await this.cacheOptions.getDefaultUsername(),
      submit: builder,
    })
  }

  async loginWithPopup(
    options: Partial<Omit<LoginOptions, 'responseMode'>> = {},
    config?: PopupConfig,
  ): Promise<Authorization> {
    try {
      ;(options as Partial<LoginOptions>).responseMode = 'fragment'
      const request = await this.buildAuthorizeRequest(options)
      const response = await this.api.authorizeWithPopup(request, config)
      const authorization = await this.verifyAuthorizeResponse(
        request,
        response,
      )

      return authorization
    } finally {
      this.ui.close()
    }
  }

  async login(options: Partial<LoginOptions> = {}): Promise<void> {
    const request: AuthorizeRequest = await this.buildAuthorizeRequest(options)

    const url = this.api.buildAuthorizeUrl(request)

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(url)
    }

    this.window.location.href = url
  }

  async loginCallback<T>(
    options?: Partial<LoginCallbackOptions>,
  ): Promise<LoginCallbackResponse<T>> {
    const url = options?.url ?? this.window.location.href

    const request: AuthorizeRequest =
      await this._clientStore.getAuthorizeRequest()

    let response: AuthorizeResponse
    if (request.response_mode === 'fragment') {
      response = this.api.parseAuthorizeResponseFromFragment(url)
    } else if (request.response_mode === 'query') {
      response = this.api.parseAuthorizeResponseFromQuery(url)
    } else {
      throw new Error('Unsupported response_mode')
    }

    return {
      authorization: await this.verifyAuthorizeResponse(request, response),
      state: util.encoding.decodeState<T>(request.state),
    }
  }

  async verifyAuthorizeResponse(
    request: AuthorizeRequest,
    response: AuthorizeResponse,
  ): Promise<Authorization> {
    if (request.state !== response.state) {
      throw new Error("states don't match")
    }

    const openidConfiguration = await this.getOpenIdConfiguration(
      request.login_hint,
    )

    const tokenRequest: TokenWithAuthorizationCodeRequest = {
      url: openidConfiguration.token_endpoint,
      client_id: request.client_id,
      client_secret: request.client_secret,
      client_auth_method: request.client_auth_method,
      grant_type: 'authorization_code',
      code: response.code,
      code_verifier: await this._clientStore.getVerifier(
        request.code_challenge,
      ),
      redirect_uri: request.redirect_uri,
    }

    const tokenResponse: TokenResponse =
      await this.api.getTokenWithAuthorizationCode(tokenRequest)

    const idToken = await util.crypto.verifyIdToken(
      util.crypto.createRemoteJWKGetter(openidConfiguration.jwks_uri),
      tokenResponse.id_token!,
      request.nonce,
    )

    const authorization: Authorization = {
      accessToken: tokenResponse.access_token,
      // TODO: The server isn't returning the scope along with the callback and
      // I havn't found the oidc docs to figure out if this is a bug.
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      idToken,
      scope: util.getSortedScope(request.scope),
      resource: request.resource,
    }

    await this._clientStore.setAuthorization(authorization)

    return authorization
  }

  async getOpenIdConfiguration(username: string): Promise<any> {
    if (this.cacheOptions.issuer) {
      const openidConfiguration =
        await this._clientStore.getOpenIdConfiguration(username)
      if (openidConfiguration) {
        return openidConfiguration
      }
    }

    const openidConfiguration = await this.issuerResolver.resolve(
      username,
      this.fallbackIssuer,
    )

    await this._clientStore.setOpenIdConfiguration(
      username,
      openidConfiguration,
      typeof this.cacheOptions.issuer === 'number'
        ? this.cacheOptions.issuer
        : 3600_000,
    )

    return openidConfiguration
  }

  async authorization(
    options: AuthorizationOptions = {},
  ): Promise<Authorization> {
    return this._clientStore.getAuthorization(options)
  }

  async user(options: UserOptions = {}): Promise<UserInfo> {
    const claims = options.claims ?? [
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
      'wallet_address',
      'wallet_type_hint',
    ]

    const authorization = await this.authorization(options)

    const userinfo: UserInfo = {
      sub: authorization.idToken.sub,
    }

    // If we should only read from cache.
    if (this.cacheOptions.userinfo) {
      for (const claim of claims) {
        if (authorization.idToken[claim]) {
          userinfo[claim] = authorization.idToken[claim]
        }
      }

      return userinfo
    }

    const openidConfiguration = await this.getOpenIdConfiguration(
      authorization.idToken.sub,
    )

    const request: UserInfoRequest = {
      client_id: this.fallbackLoginOptions.clientID,
      client_secret: this.fallbackLoginOptions.clientSecret,
      client_auth_method: this.fallbackLoginOptions.clientAuthMethod,
      access_token: authorization.accessToken,
      url: openidConfiguration.userinfo_endpoint,
    }

    const response = await this.api.userinfo(request)

    for (const claim of claims) {
      if (response[claim]) {
        userinfo[claim] = response[claim]
      }
    }

    return userinfo
  }

  async buildLogoutRequest(options: LogoutOptions): Promise<LogoutRequest> {
    const authorization = await this.authorization(options)

    const openidConfiguration = await this.getOpenIdConfiguration(
      authorization.idToken.sub,
    )

    if (openidConfiguration.end_session_endpoint == null) {
      throw new Error('end_session_endpoint must exist')
    }

    const postLogoutRedirectUri =
      options.postLogoutRedirectUri ??
      this.fallbackLogoutOptions.postLogoutRedirectUri

    if (postLogoutRedirectUri == null) {
      throw new Error('postLogoutRedirectUri must be supplied')
    }

    const request: LogoutRequest = {
      client_id: this.fallbackLoginOptions.clientID,
      client_secret: this.fallbackLoginOptions.clientSecret,
      client_auth_method: this.fallbackLoginOptions.clientAuthMethod,
      url: openidConfiguration.end_session_endpoint,
      id_token_hint: authorization.idToken.__raw,
      post_logout_redirect_uri: postLogoutRedirectUri,
      state: util.encoding.encodeState(options.state),
    }

    await this._clientStore.setLogoutRequest(request)

    return request
  }

  async logout({
    clientID,
    username,
    scope,
    resource,
    ...options
  }: Partial<LogoutOptions> = {}): Promise<void> {
    const logoutOptions: LogoutOptions = {
      ...this.fallbackLogoutOptions,
      ...options,
    }

    const authorizationOptions = {clientID, username, scope, resource}

    if (!logoutOptions.rpInitiatedLogout) {
      await this._clientStore.deleteAuthorization(authorizationOptions)
      return
    }

    const request = await this.buildLogoutRequest(logoutOptions)

    const url = this.api.buildLogoutUrl(request)

    if (typeof logoutOptions.beforeRedirect === 'function') {
      await logoutOptions.beforeRedirect(url)
    }

    await this._clientStore.deleteAuthorization(authorizationOptions)

    this.window.location.href = url
  }

  async logoutCallback<T>(options: LogoutCallbackOptions = {}): Promise<T> {
    const url = options?.url ?? this.window.location.href

    const request: LogoutRequest = await this._clientStore.getLogoutRequest()

    const response: AuthorizeResponse =
      this.api.parseAuthorizeResponseFromQuery(url)

    await this.verifyLogoutResponse(request, response)

    return util.encoding.decodeState<T>(request.state)
  }

  async verifyLogoutResponse(
    request: LogoutRequest,
    response: LogoutResponse,
  ): Promise<void> {
    if (request.state !== response.state) {
      throw new Error("states don't match")
    }
  }
}
