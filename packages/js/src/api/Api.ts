import {PopupClosedError, PopupTimeoutError} from '../errors/errors'
import {UserInfo} from '../types'
import {objectFromURLSearchParams} from '../util'
import toBase64 from '../util/encoding/toBase64'
import ApiError from './ApiError'
import {
  ApiOptions,
  AuthorizeRequest,
  AuthorizeResponse,
  AuthorizeWithDeviceRequest,
  AuthorizeWithDeviceResponse,
  BaseRequest,
  IntrospectRequest,
  IntrospectResponse,
  JWKSRequest,
  JWKSResponse,
  LogoutRequest,
  PopupConfig,
  RevokeRequest,
  TokenRequest,
  TokenResponse,
  TokenWithAuthorizationCodeRequest,
  TokenWithClientCredentialsRequest,
  TokenWithDeviceCodeRequest,
  TokenWithPasswordRequest,
  TokenWithRefreshTokenRequest,
  TokenWithSAMLRequest,
  UserInfoRequest,
} from './types'

export default class Api {
  static Error = ApiError

  constructor(public options: ApiOptions) {}

  buildAuthorizeUrl(request: AuthorizeRequest): string {
    return this._buildUrl(request)
  }

  buildLogoutUrl(request: LogoutRequest): string {
    return this._buildUrl(request)
  }

  parseAuthorizeResponseFromFragment(url: string): AuthorizeResponse {
    return this._validateResponse(
      objectFromURLSearchParams(
        new URLSearchParams(new URL(url).hash.substring(1)),
      ),
    )
  }

  parseAuthorizeResponseFromQuery(url: string): AuthorizeResponse {
    return this._validateResponse(
      objectFromURLSearchParams(new URL(url).searchParams),
    )
  }

  async authorizeWithPopup(
    request: AuthorizeRequest,
    config: PopupConfig = {},
  ): Promise<AuthorizeResponse> {
    if (!this.options.window) {
      throw new Error('no window in options')
    }

    const url = this.buildAuthorizeUrl(request)

    let popup: Window | undefined | null = config.popup
    const timeout: number = config.timeout ?? 300000
    if (!popup) {
      popup = this.options.window.open(
        url,
        'uauth:authorize:popup',
        `left=${
          this.options.window.screenX +
          (this.options.window.innerWidth - 400) / 2
        },top=${
          this.options.window.screenY +
          (this.options.window.innerHeight - 600) / 2
        },width=400,height=600,resizable,scrollbars=yes,status=1`,
      )

      if (!popup) {
        throw new Error('popup failed to be constructed')
      }
    } else {
      popup.location.href = url
    }

    let recievedMessage = false
    const response: AuthorizeResponse = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!recievedMessage) {
          clearInterval(intervalId)
          popup!.close()
          reject(new PopupTimeoutError())
        }
      }, timeout)

      const intervalId = setInterval(() => {
        // Check if popup is closed
        if (!recievedMessage && popup?.closed) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          reject(new PopupClosedError())
        }

        // Check if popup doesn't violate the "Same-Origin" policy and has a valid url
        let href: string
        let url: URL
        let redirectUrl: URL
        try {
          href = popup!.location.href
          url = new URL(href)
          redirectUrl = new URL(request.redirect_uri)
        } catch (error) {
          return // Exit if not
        }

        // Check to see that the redirect was correct
        url.hash = ''
        if (url.href === redirectUrl.href) {
          recievedMessage = true

          clearInterval(intervalId)
          clearTimeout(timeoutId)
          popup!.close()

          try {
            resolve(this.parseAuthorizeResponseFromFragment(href))
          } catch (error) {
            reject(error)
          }
        }
      }, 10)
    })

    return response
  }

  async authorizeWithDevice(
    request: AuthorizeWithDeviceRequest,
  ): Promise<AuthorizeWithDeviceResponse> {
    return {} as any
  }

  async getToken(request: TokenRequest): Promise<TokenResponse> {
    const [input, init] = this._buildRequest(request, {method: 'POST'})
    return this._fetchJSON(input, init)
  }

  introspect(request: IntrospectRequest): Promise<IntrospectResponse> {
    const [input, init] = this._buildRequest(request, {method: 'POST'})
    return this._fetchJSON(input, init)
  }

  async revoke(request: RevokeRequest): Promise<void> {
    const [input, init] = this._buildRequest(request, {method: 'POST'})
    await this._fetchJSON(input, init)
  }

  userinfo(request: UserInfoRequest): Promise<UserInfo> {
    const [input, init] = this._buildRequest(request, {
      method: 'GET',
      headers: {Authorization: `Basic ${request.access_token}`},
    })
    return this._fetchJSON(input, init)
  }

  jwks(request: JWKSRequest): Promise<JWKSResponse> {
    const [input, init] = this._buildRequest(request, {method: 'GET'})
    return this._fetchJSON(input, init)
  }

  getTokenWithAuthorizationCode(
    request: TokenWithAuthorizationCodeRequest,
  ): Promise<TokenResponse> {
    return this.getToken(request)
  }

  getTokenWithRefreshToken(
    request: TokenWithRefreshTokenRequest,
  ): Promise<TokenResponse> {
    return this.getToken(request)
  }

  getTokenWithDeviceCode(
    request: TokenWithDeviceCodeRequest,
  ): Promise<TokenResponse> {
    return this.getToken(request)
  }

  getTokenWithPassword(
    request: TokenWithPasswordRequest,
  ): Promise<TokenResponse> {
    return this.getToken(request)
  }

  getTokenWithSAML(request: TokenWithSAMLRequest): Promise<TokenResponse> {
    return this.getToken(request)
  }

  getTokenWithClientCredentials(
    request: TokenWithClientCredentialsRequest,
  ): Promise<TokenResponse> {
    return this.getToken(request)
  }

  private _buildUrl(request: BaseRequest): string {
    const {url, ...searchParams} = request

    const urlObject = new URL(url)

    const params = new URLSearchParams()

    for (const [k, v] of Object.entries(searchParams)) {
      if (k != null && v != null) {
        params.append(k, v)
      }
    }

    urlObject.search = params.toString()
    return urlObject.toString()
  }

  private _buildRequest(
    request: BaseRequest,
    options: {method: 'GET' | 'POST'; headers?: HeadersInit},
  ): [RequestInfo, RequestInit] {
    const {url, client_id, client_secret, client_auth_method, ...rest} = request
    const {headers: headersInit, method} = options

    const headers = new Headers(this.options.headers ?? [])

    new Headers(headersInit ?? []).forEach((value, key) => {
      headers.set(key, value)
    })

    if (options.method === 'POST') {
      headers.set('Content-Type', 'application/x-www-form-urlencoded')
    }

    const body: Record<string, any> = {
      client_id,
      ...rest,
    }

    switch (client_auth_method) {
      case 'client_secret_basic':
        // throw new Error('only client_secret_post supported')
        if (client_secret == null) {
          throw new Error('Client secret not present!')
        }

        headers.set(
          'Authorization',
          `Basic ${toBase64(`${client_id}:${client_secret}`)}`,
        )

        break
      case 'client_secret_post':
        if (client_secret == null) {
          throw new Error('Client secret not present!')
        }

        body.client_secret = client_secret

        break
      case 'none':
      case undefined:
      case null:
        break
      default:
        throw new Error('Bad client_auth_method')
    }

    return [
      url,
      {
        method,
        headers,
        body:
          method === 'POST'
            ? new URLSearchParams(Object.entries(body))
            : undefined,
      },
    ]
  }

  private _validateResponse(response: any) {
    if (response.error) {
      throw Api.Error.fromResponse(response)
    }

    return response
  }

  private async _fetchJSON(
    input: RequestInfo,
    init: RequestInit,
  ): Promise<any> {
    if (init.headers) {
      const headers = new Headers(init.headers)
      headers.set('Accept', 'application/json')
      init.headers = headers
    } else {
      init.headers = {Accept: 'application/json'}
    }

    if (!this.options.window) {
      throw new Error('no window in options')
    }

    const response = await this.options.window?.fetch(input, init)

    const json = await response.json()
    this._validateResponse(json)

    if (!response.ok) {
      throw new Error(
        `${response.status} ${response.statusText}: ${JSON.stringify(json)}`,
      )
    }

    return json
  }
}
