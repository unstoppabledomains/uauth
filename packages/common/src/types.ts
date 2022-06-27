export interface IssuerMetadata {
  issuer: string
  authorization_endpoint?: string
  token_endpoint?: string
  jwks_uri?: string
  userinfo_endpoint?: string
  revocation_endpoint?: string
  end_session_endpoint?: string
  registration_endpoint?: string
  token_endpoint_auth_methods_supported?: string[]
  token_endpoint_auth_signing_alg_values_supported?: string[]
  introspection_endpoint_auth_methods_supported?: string[]
  introspection_endpoint_auth_signing_alg_values_supported?: string[]
  revocation_endpoint_auth_methods_supported?: string[]
  revocation_endpoint_auth_signing_alg_values_supported?: string[]
  request_object_signing_alg_values_supported?: string[]

  [key: string]: unknown
}

export interface JRDLink {
  // URI
  rel: string

  // URI used for looking it up if rel is not some URL.
  href?: string

  // Media type (MIME type), See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  type?: string

  // Mapping of language to title, with default being a fallback language
  // Uses Language Tags, See: https://datatracker.ietf.org/doc/html/rfc1766
  titles?: Record<string, string>
}

export interface JRDDocument {
  // URI describing the subject of the document
  subject: string

  // URIs the document might also refer to
  aliases?: string[]

  // Mapping of URIs to arbitrary strings
  properties?: Record<string, string>

  // List of JRDLink objects
  links?: JRDLink[]

  // Date at witch this document expires
  expires?: number | string
}

export interface IPFSResolver {
  // See this doc for more: https://docs.ipfs.io/how-to/address-ipfs-on-web/#native-urls
  resolve(url: string): Promise<string>
}

export interface DomainResolver {
  records(domain: string, keys: string[]): Promise<Record<string, string>>
}

export interface WebFingerResolver {
  resolve(
    domain: string,
    user: string,
    rel: string,
    fallbackIssuer: string,
  ): Promise<JRDDocument>
}

export interface IssuerResolver {
  resolve(username: string, fallbackIssuer: string): Promise<IssuerMetadata>
}

type MaybePromise<T> = Promise<T> | T

// Identical to a partial Map<string, string>
export interface Cache {
  get(key: string): MaybePromise<string | undefined>
  set(key: string, value: string): MaybePromise<Cache>
  delete(key: string): MaybePromise<boolean>
  entries(): MaybePromise<IterableIterator<[string, string]>>
  clear(): MaybePromise<void>
}

export interface WebFingerRecord {
  host?: string
  uri?: string
  value?: string
}

export interface WebFingerResolverOptions {
  ipfsResolver: IPFSResolver
  domainResolver: DomainResolver
}

export interface IssuerResolverOptions {
  webfingerResolver: WebFingerResolver
}

export interface AddressClaim {
  formatted: string
  street_address: string
  locality: string
  region: string
  postal_code: string
  country: string
}

export interface UserInfo {
  sub: string

  wallet_address?: string
  wallet_type_hint?: 'web3' | 'walletconnect'

  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phone_number?: string
  phone_number_verified?: boolean
  address?: AddressClaim
  updated_at?: string
}

export interface IdToken extends UserInfo {
  // This is where the raw JWT is stored.
  __raw: string

  iss?: string
  aud?: string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  azp?: string
  nonce?: string
  auth_time?: string
  at_hash?: string
  c_hash?: string
  acr?: string
  amr?: string
  sub_jwk?: string
  cnf?: string
  sid?: string
  org_id?: string

  [key: string]: any
}

export interface Authorization {
  accessToken: string
  expiresAt: number
  idToken: IdToken
  scope: string
  audience?: string
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
  login_hint?: string
  max_age: number // number ?
  nonce: string
  prompt: string
  resource?: string
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
