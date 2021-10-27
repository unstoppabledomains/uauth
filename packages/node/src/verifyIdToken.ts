import {IdToken} from '@uauth/common'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'

const verifyIdToken = async (
  jwks_uri: string | undefined,
  jwks: string | undefined,
  id_token: string,
  nonce: string,
): Promise<IdToken> => {
  let secretOrPublicKey: jwt.Secret | jwt.GetPublicKeyOrSecret
  if (jwks_uri) {
    secretOrPublicKey = (header, cb) => {
      fetch(jwks_uri)
        .then(res => res.json())
        .then(({keys}) => {
          const key = keys.find(k => k.kid === header.kid)
          if (key) {
            cb(null, jwkToPem(key))
            return
          }
          throw new Error(
            `Unable to find a signing key that matches '${header.kid}'`,
          )
        })
        .catch(cb)
    }
  } else {
    throw new Error('jwks not supported only jwks_uri')
  }

  const options: jwt.VerifyOptions = {}

  const idToken: IdToken = await new Promise((resolve, reject) => {
    jwt.verify(id_token, secretOrPublicKey, options, (error, decoded) => {
      if (error) {
        reject(error)
      }
      resolve(decoded! as IdToken)
    })
  })

  idToken.__raw = id_token

  if (nonce !== idToken.nonce) {
    throw new Error("nonces don't match")
  }

  return idToken
}

export default verifyIdToken
