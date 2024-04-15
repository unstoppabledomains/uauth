import {
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  DomainResolver,
  IssuerResolver,
} from '@uauth/common'
import {
  Resolution,
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
import {StorageStore, Store, StoreType} from './store'
import {
  Authorization,
  AuthorizationOptions,
  VerifiedAddress,
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
import {VERSION} from './version'
import {getScopesList} from './util/getScopesList'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.JS = VERSION
}

export default class Client {
  util = util
  private _clientStore = new ClientStore(this)
  api: Api
  fallbackIssuer: string
  fallbackLoginOptions: BaseLoginOptions
  fallbackLogoutOptions: BaseLogoutOptions
  cacheOptions: CacheOptions
  issuerResolver: IssuerResolver
  resolution: DomainResolver

  store?: Store
  storeOptions: {
    store?: Store
    storeType: StoreType
  }

  getStore(): Store {
    if (this.store) {
      return this.store
    }

    if (this.storeOptions.store) {
      this.store = this.storeOptions.store
    } else {
      const storeType = this.storeOptions.storeType
      switch (storeType) {
        case 'localstore':
          this.store = new StorageStore(window.localStorage)
          break
        case 'sessionstore':
          this.store = new StorageStore(window.sessionStorage)
          break
        case 'memory':
          this.store = new Map<string, string>()
          break
        default:
          throw new Error('Bad storeType provided')
      }
    }

    return this.store
  }

  constructor(options: ClientOptions) {
    this.fallbackIssuer =
      options.fallbackIssuer ?? 'https://auth.unstoppabledomains.com'
    this.resolution =
      options.resolution ??
      // obtain a key by following the following document, and set the environment variable RESOLUTION_API_KEY.
      // https://docs.unstoppabledomains.com/domain-distribution-and-management/quickstart/retrieve-an-api-key/#api-key
      new Resolution({apiKey: process.env.RESOLUTION_API_KEY})

    this.storeOptions = {
      store: options.store,
      storeType: options.storeType ?? 'localstore',
    }

    this.cacheOptions = {
      issuer: false,
      userinfo: true,
      ...(options.cacheOptions ?? {}),
    }

    this.api = new Api({
      headers: {},
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

  async buildAuthorizeRequest(
    options: Partial<LoginOptions>,
  ): Promise<AuthorizeRequest> {
    // TODO: Ensure nothing is missing
    const loginOptions: FullLoginOptions = {
      ...this.fallbackLoginOptions,
      ...options,
    } as FullLoginOptions

    const loginHint = options.username

    const openidConfiguration = await this.getOpenIdConfiguration(loginHint)

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

      // Builder options
      flow_id: loginOptions.flowId ?? 'login',
      login_hint: loginHint,

      // Parameterized options
      client_id: loginOptions.clientID,
      client_secret: loginOptions.clientSecret,
      client_auth_method: loginOptions.clientAuthMethod,
      max_age: loginOptions.maxAge,
      prompt: loginOptions.prompt,
      resource: loginOptions.resource,
      redirect_uri: loginOptions.redirectUri,
      response_mode: loginOptions.responseMode,
      scope: loginOptions.scope,

      // Constant options
      code_challenge_method: 'S256',
      response_type: 'code',

      // package info
      package_name: loginOptions?.packageName || '@uauth/js',
      package_version: loginOptions?.packageVersion || VERSION,

      signup_suggestion: loginOptions.signupSuggestion,
    }

    await this._clientStore.setAuthorizeRequest(request)
    await this._clientStore.setVerifier(challenge, verifier)

    return request
  }

  async loginWithPopup(
    options: Partial<Omit<LoginOptions, 'responseMode'>> = {},
    config?: PopupConfig,
  ): Promise<Authorization> {
    ;(options as Partial<LoginOptions>).responseMode = 'fragment'
    const request = await this.buildAuthorizeRequest(options)
    const response = await this.api.authorizeWithPopup(request, config)
    const authorization = await this.verifyAuthorizeResponse(request, response)

    return authorization
  }

  async login(options: Partial<LoginOptions> = {}): Promise<void> {
    const request: AuthorizeRequest = await this.buildAuthorizeRequest(options)

    const url = this.api.buildAuthorizeUrl(request)

    if (typeof options.beforeRedirect === 'function') {
      await options.beforeRedirect(url)
    }

    window.location.href = url
  }

  async loginCallback<T>(
    options?: Partial<LoginCallbackOptions>,
  ): Promise<LoginCallbackResponse<T>> {
    const url = options?.url ?? window.location.href

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
      openidConfiguration.jwks_uri,
      tokenResponse.id_token!,
      request.nonce,
      request.client_id,
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

  // getVerifiedAccounts retrieves all verified accounts associated with the domain
  getVerifiedAccounts(
    authorization: Authorization,
    symbols: string[] = [],
  ): VerifiedAddress[] {
    // ensure the authorization includes verified_addresses field
    const verifiedAddresses: VerifiedAddress[] = []
    if (!authorization.idToken.verified_addresses) {
      return verifiedAddresses
    }
    authorization.idToken.verified_addresses.forEach((record: any) => {
      // filter for requested symbols if provided
      if (symbols.length > 0 && !symbols.includes(record.symbol)) {
        return
      }
      // include the verified address
      verifiedAddresses.push({
        address: record.address,
        message: record.proof.message,
        signature: record.proof.signature,
        symbol: record.symbol,
      })
    })

    // return the verified address list
    return verifiedAddresses
  }

  // getAuthorizationAccount retrieves the address that authorized the request
  getAuthorizationAccount(
    authorization: Authorization,
    type = 'sig',
    version = 'v1',
  ): VerifiedAddress | undefined {
    // find the requested proof key from AMR field
    const sigProofKeys = authorization.idToken.amr?.filter((key: string) =>
      key.startsWith(`${version}.${type}`),
    )

    // validate the proof key is located
    if (!sigProofKeys || sigProofKeys.length == 0) {
      return undefined
    }

    // extract the signature address
    const sigAddress = sigProofKeys[0].split('.')[3]
    const verifiedAccounts = this.getVerifiedAccounts(authorization)
    if (!verifiedAccounts) {
      return undefined
    }

    // find and return the proof address from verified account list
    for (const account of verifiedAccounts) {
      if (account.address === sigAddress) {
        return account
      }
    }
  }

  async getOpenIdConfiguration(username?: string): Promise<any> {
    if (this.cacheOptions.issuer) {
      const openidConfiguration =
        await this._clientStore.getOpenIdConfiguration(username ?? '')
      if (openidConfiguration) {
        return openidConfiguration
      }
    }

    const openidConfiguration = username
      ? await this.issuerResolver.resolve(username, this.fallbackIssuer)
      : await fetch(
          this.fallbackIssuer + '/.well-known/openid-configuration',
        ).then(resp =>
          resp.ok
            ? resp.json()
            : Promise.reject(new Error('bad openid-configuration response')),
        )

    await this._clientStore.setOpenIdConfiguration(
      username ?? '',
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
    const authorization = await this._clientStore.getAuthorization(options)

    if (authorization.scope && !this.checkPremiumScopes(authorization.scope)) {
      authorization.upgrade = {
        text: 'Please contact Unstoppable Domains to upgrade your account to access premium scopes bd@unstoppabledomains.com',
        upgrade_for_premium: getScopesList({premium: true}).join(' '),
      }
    }

    return authorization
  }

  checkPremiumScopes(scopes: string) {
    return (
      scopes
        .split(' ')
        .filter(el => !getScopesList({premium: false}).includes(el)).length > 0
    )
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
      'eip4361_message',
      'eip4361_signature',
      'humanity_check_id',
    ]

    const authorization = await this.authorization(options)

    const userinfo: UserInfo = {
      sub: authorization.idToken.sub,
    }

    if (authorization.upgrade) {
      userinfo.upgrade = authorization.upgrade
      userinfo.email = 'upgrade-for-premium'
      userinfo.address = {
        formatted: 'upgrade-for-premium',
        street_address: 'upgrade-for-premium',
        locality: 'upgrade-for-premium',
        region: 'upgrade-for-premium',
        postal_code: 'upgrade-for-premium',
        country: 'upgrade-for-premium',
      }
      userinfo.phone_number = 'upgrade-for-premium'
      userinfo.name = 'upgrade-for-premium'
      userinfo.given_name = 'upgrade-for-premium'
      userinfo.family_name = 'upgrade-for-premium'
      userinfo.middle_name = 'upgrade-for-premium'
      userinfo.nickname = 'upgrade-for-premium'
      userinfo.preferred_username = 'upgrade-for-premium'
      userinfo.profile = 'upgrade-for-premium'
      userinfo.picture =
        'https://storage.googleapis.com/unstoppable-client-assets/images/partners/avatar-placeholder.png'
      userinfo.website = 'upgrade-for-premium'
      userinfo.gender = 'upgrade-for-premium'
      userinfo.birthdate = 'upgrade-for-premium'
      userinfo.zoneinfo = 'upgrade-for-premium'
      userinfo.locale = 'upgrade-for-premium'
      userinfo.updated_at = 'upgrade-for-premium'
      userinfo.humanity_check_id = 'upgrade-for-premium'
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

    window.location.href = url
  }

  async logoutCallback<T>(options: LogoutCallbackOptions = {}): Promise<T> {
    const url = options?.url ?? window.location.href

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
