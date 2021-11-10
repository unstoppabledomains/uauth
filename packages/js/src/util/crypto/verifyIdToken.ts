import {IdToken} from '@uauth/common'
import {Jose} from 'jose-jwe-jws'
import type {CryptoKeyGetter} from '../../types'

const verifyIdToken = async (
  keyGetter: CryptoKeyGetter,
  id_token: string,
  nonce: string,
): Promise<IdToken> => {
  const [verification] = await new Jose.JoseJWS.Verifier(
    new Jose.WebCryptographer(),
    id_token,
    keyGetter,
  ).verify()

  if (!verification.verified) {
    throw new Error('Failed to verify id_token!')
  }

  const idToken: IdToken = JSON.parse(verification.payload!)

  idToken.__raw = id_token

  if (nonce !== idToken.nonce) {
    throw new Error("nonces don't match")
  }

  return idToken
}

export default verifyIdToken
