import {writeFileSync} from 'fs'
import {fromKeyLike} from 'jose/jwk/from_key_like'
import {generateKeyPair} from 'jose/util/generate_key_pair'
import path from 'path'
;(async () => {
  const {privateKey, publicKey} = await generateKeyPair('RS256')

  writeFileSync(
    path.join(__dirname, '..', '.jwk-private.json'),
    JSON.stringify(await fromKeyLike(privateKey)),
  )

  writeFileSync(
    path.join(__dirname, '..', '.jwk-public.json'),
    JSON.stringify(await fromKeyLike(publicKey)),
  )
})().catch(e => {
  console.error('error:', e)
})
