import {IdToken} from '@uauth/common'
import {Jose} from 'jose-jwe-jws'

const verifyIdToken = async (
  jwks_uri: string | undefined,
  jwks: string | undefined,
  id_token: string,
  nonce: string,
): Promise<IdToken> => {
  const [verification] = await new Jose.JoseJWS.Verifier(
    new Jose.WebCryptographer(),
    id_token,
    async kid => {
      if (!jwks_uri) {
        throw new Error('only jwks_uri supported for now')
      }

      return fetch(jwks_uri)
        .then(res => res.json())
        .then(({keys}) => {
          const key = keys.find(k => k.kid === kid)
          if (key) {
            return Jose.Utils.importRsaPublicKey(key, 'RS256')
          }

          throw new Error(`Unable to find a signing key that matches '${kid}'`)
        })
    },
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
