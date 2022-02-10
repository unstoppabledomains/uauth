import {IdToken} from '@uauth/common'
import {jwtVerify, createRemoteJWKSet} from 'jose'

const verifyIdToken = async (
  jwks_uri: string,
  id_token: string,
  nonce: string,
  client_id: string,
) => {
  const {payload} = await jwtVerify(
    id_token,
    createRemoteJWKSet(new URL(jwks_uri)),
    {audience: client_id},
  )

  const idToken: IdToken = payload as any

  idToken.__raw = id_token

  if (nonce !== idToken.nonce) {
    throw new Error("nonces don't match")
  }

  return idToken
}

export default verifyIdToken
