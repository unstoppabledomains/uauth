import type AbstractUI from '@uauth/abstract-ui'
import type {DomainResolver} from '@uauth/common'
import type {DomUIConstructorOptions} from '@uauth/dom-ui'
import type {AuthorizeRequest} from './api'
import type {Store, StoreType} from './store'

export interface Fetcher {
  fetch(input: RequestInfo, init: RequestInit): Promise<Response>
}

export type CodeChallengeMethod = 'S256' | 'plain'

export type StandardResponseMode = 'fragment' | 'query'
export type FormPostResponseMode = 'form_post'
export type WebMessageResponseMode = 'web_message'
export type ResponseMode =
  | StandardResponseMode
  | FormPostResponseMode
  | WebMessageResponseMode

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

export type ClientAuthMethod =
  | 'client_secret_basic'
  | 'client_secret_post'
  // | 'client_secret_jwt'
  // | 'private_key_jwt'
  | 'none'

export interface AddressClaim {
  formatted: string
  street_address: string
  locality: string
  region: string
  postal_code: string
  country: string
}

export type WalletType = 'web3' | 'walletconnect'

export interface WalletClaims {
  wallet_address: string
  wallet_type_hint: WalletType
}

export interface EmailClaims {
  email: string
  email_verified: boolean
}

export interface PhoneClaims {
  phone_number: string
  phone_number_verified: boolean
}

export interface AddressClaims {
  address: AddressClaim
}

export interface ProfileClaims {
  name: string
  given_name: string
  family_name: string
  middle_name: string
  nickname: string
  preferred_username: string
  profile: string
  picture: string
  website: string
  gender: string
  birthdate: string
  zoneinfo: string
  locale: string
  updated_at: string
}

export interface UserInfo
  extends Partial<WalletClaims>,
    Partial<EmailClaims>,
    Partial<AddressClaims>,
    Partial<PhoneClaims>,
    Partial<ProfileClaims> {
  sub: string
}

export interface JWTClaims {
  iss: string
  aud: string
  exp: number
  nbf: number
  iat: number
  jti: string
  azp: string
  nonce: string
  auth_time: string
  at_hash: string
  c_hash: string
  acr: string
  amr: string
  sub_jwk: string
  cnf: string
  sid: string
  org_id: string
}

export interface IdToken extends UserInfo, Partial<JWTClaims> {
  // This is where the raw JWT is stored.
  __raw: string

  [key: string]: any
}

export interface CryptoKeyGetter {
  (kid: string): Promise<CryptoKey>
}

export interface Authorization {
  accessToken: string
  expiresAt: number
  idToken: IdToken
  scope: string
  resource?: string
}

export interface LoginCallbackOptions {
  url?: string
}

export interface LoginCallbackResponse<T> {
  authorization: Authorization
  state?: T
}

export interface AuthorizationOptions {
  clientID?: string
  username?: string
  scope?: string
  resource?: string
}

export interface UserOptions extends AuthorizationOptions {
  claims?: string[]
}

export interface LogoutCallbackOptions {
  url?: string
}

export interface CacheOptions {
  issuer?: boolean | number
  userinfo?: boolean
  getDefaultUsername(): Promise<string> | string
  setDefaultUsername?(username: string): Promise<void> | void
}

export interface ClientOptions {
  // Fallback Login Options
  clientID: string
  clientSecret?: string
  redirectUri: string
  clientAuthMethod?: ClientAuthMethod
  resource?: string
  responseMode?: ResponseMode
  scope?: string
  prompt?: string
  maxAge?: number

  // Fallback Logout Options
  rpInitiatedLogout?: boolean
  postLogoutRedirectUri?: string

  // Cache Options
  cacheOptions?: CacheOptions

  ui?: AbstractUI<AuthorizeRequest>
  uiOptions?: DomUIConstructorOptions

  // Other Options
  window?: Window
  fallbackIssuer?: string
  storeType?: StoreType
  store?: Store
  createIpfsUrl?: (cid: string, path: string) => string
  resolution?: DomainResolver
}

export type UAuthConstructorOptions = ClientOptions

export interface BaseLoginOptions {
  clientID: string
  clientSecret?: string
  clientAuthMethod: ClientAuthMethod
  maxAge: number
  prompt: string
  resource?: string
  redirectUri: string
  responseMode: ResponseMode
  scope: string
}

export interface LoginOptions extends Partial<BaseLoginOptions> {
  username: string
  state?: any
  beforeRedirect?(url: string): Promise<void> | void
}

export interface FullLoginOptions extends BaseLoginOptions {
  username?: string
  state?: any
  beforeRedirect?(url: string): Promise<void> | void
}

export interface BaseLogoutOptions {
  rpInitiatedLogout: boolean
  postLogoutRedirectUri?: string
}

export interface LogoutOptions extends BaseLogoutOptions, AuthorizationOptions {
  state?: any
  beforeRedirect?(url: string): Promise<void> | void
}
