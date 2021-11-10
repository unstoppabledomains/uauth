import {Jose} from 'jose-jwe-jws'
import {CryptoKeyGetter} from '../../types'

const createRemoteJWKGetter: (jwks_uri: string) => CryptoKeyGetter =
  (jwks_uri: string) =>
  async (kid: string): Promise<CryptoKey> => {
    const {keys} = await fetch(jwks_uri).then(res => res.json())

    const key = keys.find(k => k.kid === kid)
    if (key) {
      return Jose.Utils.importPublicKey(key, 'RS256')
    }

    throw new Error(`Unable to find a signing key that matches '${kid}'`)
  }

export default createRemoteJWKGetter
