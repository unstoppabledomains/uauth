import {DomainResolver} from '@uauth/common'
import {Authorization, UserInfo} from './custom'

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// See: https://eips.ethereum.org/EIPS/eip-3085
export interface NetworkConfig {
  chainId: string
  blockExplorerUrls?: string[]
  chainName?: string
  iconUrls?: string[]
  nativeCurrency?: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls?: string[]
}

type Provider = any

export interface SDKOptions {
  fallbackIssuer: string // not required
  clientID: string
  redirectUri: string // must be included unless you specify it per request
  postLogoutRedirectUri?: string // not required
  scope: string // Defaults to "openid"
  audience?: string // not required, maybe call it reference?
  responseType: ResponseType // must be included unless you specify it per request
  responseMode: ResponseMode // must be included unless you specify it per request
  maxAge: number // not required
  clockSkew: number // Defaults to 60
  networks?: NetworkConfig[]
  wallets?: Record<
    string,
    (
      addr: string,
      addr_type_hint: string,
    ) => Provider | void | Promise<Provider | void>
  >
  createIpfsUrl?: (cid: string, path: string) => string
  resolution: DomainResolver
  // TODO: Add resolution
  // resolution: Resolution
}

export type SDKConstructorOptions = Optional<
  SDKOptions,
  | 'fallbackIssuer'
  | 'scope'
  | 'responseType'
  | 'responseMode'
  | 'maxAge'
  | 'clockSkew'
  | 'resolution'
>

export interface SDKConstructor {
  new (options: SDKConstructorOptions)
}

export interface LoginOptions<T = any> {
  username: string
  redirectUri?: string
  scope?: string
  audience?: string
  responseType?: ResponseType
  responseMode?: ResponseMode
  state?: T
  beforeRedirect?(options: LoginOptions<T>, url: string): void | Promise<void>
}

export interface LoginCallbackOptions {
  url: string
}

export interface LoginCallbackResponse<T> {
  authorization: Authorization
  state?: T
}

export interface LogoutOptions<T> {
  postLogoutRedirectUri?: string
  state?: T
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

export interface SDK {
  buildLoginUrl<T>(options: LoginOptions<T>): Promise<string>
  login<T>(options: LoginOptions<T>): Promise<void>
  loginCallback<T>(
    options: LoginCallbackOptions,
  ): Promise<LoginCallbackResponse<T>>

  buildLogoutUrl<T>(options: LogoutOptions<T>): Promise<string>
  logout<T>(options: LogoutOptions<T>): Promise<void>
  logoutCallback<T>(
    options: LogoutCallbackOptions,
  ): Promise<LogoutCallbackResponse<T>>

  user(options: UserOptions): Promise<UserInfo>
  introspect(): void
}

export type ResponseType = 'code'

export type ResponseMode = 'fragment' | 'query' | 'form_post'

export type GrantType =
  | 'authorization_code'
  | 'implicit'
  | 'password'
  | 'refresh_token'
  | 'client_credentials'
  | 'urn:ietf:params:oauth:grant-type:jwt-bearer'
  | 'urn:ietf:params:oauth:grant-type:saml2-bearer'
  | 'urn:ietf:params:oauth:grant-type:device_code'

export type SubjectType = 'public' | 'pairwise'

export type TokenEndpointAuthMethod =
  | 'client_secret_basic'
  | 'client_secret_post'
  | 'client_secret_jwt'
  | 'private_key_jwt'
  | 'none'

export type Claim =
  | 'sub'
  | 'name'
  | 'given_name'
  | 'family_name'
  | 'middle_name'
  | 'nickname'
  | 'preferred_username'
  | 'profile'
  | 'picture'
  | 'website'
  | 'email'
  | 'email_verified'
  | 'gender'
  | 'birthdate'
  | 'zoneinfo'
  | 'locale'
  | 'phone_number'
  | 'phone_number_verified'
  | 'address'
  | 'updated_at'

export type CodeChallengeMethod = 'S256' | 'plain'

export type JWSAlgorithm =
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'ES256'
  | 'ES256K'
  | 'ES384'
  | 'ES512'
  | 'EdDSA'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'none'

export type PromptType = 'consent' | 'login' | 'login consent' | 'none'

export interface AuthorizationEndpointRequest {
  client_id: string
  code_challenge: string
  code_challenge_method: CodeChallengeMethod
  login_hint: string
  max_age: number // number ?
  nonce: string
  prompt: string
  redirect_uri: string
  response_type: ResponseType
  response_mode: ResponseMode
  request?: string
  scope: string
  // sessionToken: string
  state: string

  // Added for Index Signature
  [key: string]: any
}

export interface ErrorResponse {
  error: string
  error_description?: string
  error_uri?: string
}

export interface AuthorizationEndpointResponse {
  code: string
  state: string
  // expires_in: 300
}

export interface AuthorizationCodeTokenEndpointRequest {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
  redirect_uri: string
  client_id?: string

  [key: string]: any
}

export interface SAMLTokenEndpointRequest {
  grant_type: 'urn:ietf:params:oauth:grant-type:saml2-bearer'
  assertion: string
}

export interface ClientCredentialsTokenEndpointRequest {
  grant_type: 'client_credentials'
}

export interface PasswordTokenEndpointRequest {
  grant_type: 'password'
  password: string
  username: string
  scope: string
}

export interface RefreshTokenTokenRequest {
  grant_type: 'refresh_token'
  refresh_token: string
  scope: string
}

export interface TokenEndpointResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
  id_token?: string
}

export interface LogoutEndpointRequest {
  id_token_hint: string
  post_logout_redirect_uri?: string
  state: string
}

export interface LogoutEndpointResponse {
  state: string
}

export type RevokeTokenTypeHint = 'access_token' | 'refresh_token'

export interface RevokeEndpointRequest {
  token: string
  token_type_hint: RevokeTokenTypeHint
}

export type IntrospectTokenTypeHint =
  | 'access_token'
  | 'id_token'
  | 'refresh_token'

export interface IntrospectEndpointRequest {
  token: string
  token_type_hint: IntrospectTokenTypeHint
}

export interface IntrospectEndpointResponse {
  active: boolean
  client_id: string
  device_id: string
  scope: string
  token_type: 'Bearer'

  // JWKs
  aud: string
  exp: number
  iat: number
  iss: string
  jti: string
  nbf: number
  sub: string
}

export interface DeviceCodeEndpointRequest {
  client_id: string
}

export interface DeviceCodeEndpointResponse {
  device_code: string
  verification_uri: string
  user_code: string
  expires_in: number
  interval: number
}

export interface DeviceTokenEndpointRequest {
  grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
  client_id: string
  device_code: string
}
