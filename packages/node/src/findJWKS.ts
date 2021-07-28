import {readFileSync} from 'fs'
import {JWK} from 'oidc-provider'
import path from 'path'

export default function findJWKS(publicOrPrivate: 'public' | 'private'): {
  keys: JWK[]
} {
  return {
    keys: [
      JSON.parse(
        readFileSync(
          path.join(
            process.env.INIT_CWD!,
            '..',
            '..',
            `.jwk-${publicOrPrivate}.json`,
          ),
        ).toString(),
      ),
    ],
  }
}
