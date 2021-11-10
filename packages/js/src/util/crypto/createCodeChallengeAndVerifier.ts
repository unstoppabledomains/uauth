import type {CodeChallengeMethod} from '../../types'
import stringFromBuffer from '../encoding/stringFromBuffer'
import textEncoder from '../encoding/textEncoder'
import toUrlEncodedBase64 from '../encoding/toUrlEncodedBase64'
import getRandomBytes from './getRandomBytes'
import sha256 from './sha256'

const pkceMask =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.'

const createCodeVerifier = (length: number) => {
  return Array.from(getRandomBytes(length))
    .map(v => pkceMask[v % pkceMask.length])
    .join('')
}

const createCodeChallengeAndVerifier = async (
  length = 43,
  method: CodeChallengeMethod = 'S256',
): Promise<{verifier: string; challenge: string}> => {
  const verifier = createCodeVerifier(length)

  switch (method) {
    case 'plain':
      return {verifier, challenge: verifier}
    case 'S256':
      return {
        verifier,
        challenge: toUrlEncodedBase64(
          stringFromBuffer(await sha256(textEncoder.encode(verifier).buffer)),
        ),
      }
    default:
      throw new Error('bad challenge method')
  }
}

export default createCodeChallengeAndVerifier
