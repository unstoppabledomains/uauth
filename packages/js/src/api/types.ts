import {ClientAuthMethod, CodeChallengeMethod, ResponseMode} from '../types'

export interface BaseRequest {
  url: string
  client_id?: string
  client_secret?: string
  client_auth_method?: ClientAuthMethod
}

export interface AuthorizeRequest extends BaseRequest {
  client_id: string
  code_challenge: string
  code_challenge_method: CodeChallengeMethod
  login_hint: string
  max_age: number
  nonce: string
  prompt: string
  resource?: string
  redirect_uri: string
  response_type: 'code'
  response_mode: ResponseMode
  scope: string
  state: string
}

export interface AuthorizeWithJWTRequest {
  request: string
}

export interface PopupConfig {
  timeout?: number
  popup?: Window
}

export interface AuthorizeResponse {
  code: string
  state: string
}

export interface AuthorizeWithDeviceRequest extends BaseRequest {
  client_id: string
  scope: string
}

export interface AuthorizeWithDeviceResponse extends BaseRequest {
  verification_uri: string
  device_code: string
  user_code: string
  interval: number
  expires_in: number
}

export interface TokenWithAuthorizationCodeRequest extends BaseRequest {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
  redirect_uri: string
}

export interface TokenWithRefreshTokenRequest extends BaseRequest {
  grant_type: 'refresh_token'
  refresh_token: string
  scope: string
}

export interface TokenWithDeviceCodeRequest extends BaseRequest {
  grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
  client_id: string
  device_code: string
}

export interface TokenWithPasswordRequest extends BaseRequest {
  grant_type: 'password'
  username: string
  password: string
  scope: string
}

export interface TokenWithSAMLRequest extends BaseRequest {
  grant_type: 'urn:ietf:params:oauth:grant-type:saml2-bearer'
  assertion: string
}

export interface TokenWithClientCredentialsRequest extends BaseRequest {
  grant_type: 'client_credentials'
}

export type TokenRequest =
  | TokenWithAuthorizationCodeRequest
  | TokenWithRefreshTokenRequest
  | TokenWithDeviceCodeRequest
  | TokenWithPasswordRequest
  | TokenWithSAMLRequest
  | TokenWithClientCredentialsRequest

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
  id_token?: string
}

export interface IntrospectRequest extends BaseRequest {
  token: string
  token_type_hint:
    | 'access_token'
    | 'id_token'
    | 'refresh_token'
    | 'device_secret'
}

export interface IntrospectResponse {
  active: boolean

  // Other claims
  [key: string]: any
}

export interface RevokeRequest extends BaseRequest {
  token: string
  token_type_hint: 'access_token' | 'refresh_token' | 'device_secret'
}

export interface LogoutRequest extends BaseRequest {
  id_token_hint: string
  post_logout_redirect_uri?: string
  state: string
}

export interface LogoutResponse {
  state: string
}

export interface UserInfoRequest extends BaseRequest {
  access_token: string
}

export interface JWKSRequest extends BaseRequest {
  client_id: string
}

export interface JWKSResponse {
  keys: JsonWebKey[]
}

export interface ErrorResponse {
  error: string
  error_description: string
  error_uri?: string
}

export interface ApiOptions {
  headers?: HeadersInit
  window?: Window
}
