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
  audience: string
}
