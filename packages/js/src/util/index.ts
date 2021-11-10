import createCodeChallengeAndVerifier from './crypto/createCodeChallengeAndVerifier'
import createRemoteJWKGetter from './crypto/createRemoteJWKGetter'
import getCrypto from './crypto/getCrypto'
import getCryptoSubtle from './crypto/getCryptoSubtle'
import getRandomBytes from './crypto/getRandomBytes'
import sha256 from './crypto/sha256'
import verifyIdToken from './crypto/verifyIdToken'
import decodeState from './encoding/decodeState'
import encodeState from './encoding/encodeState'
import fromBase64 from './encoding/fromBase64'
import stringFromBuffer from './encoding/stringFromBuffer'
import textDecoder from './encoding/textDecoder'
import textEncoder from './encoding/textEncoder'
import toBase64 from './encoding/toBase64'
import toUrlEncodedBase64 from './encoding/toUrlEncodedBase64'

const crypto = {
  createCodeChallengeAndVerifier,
  createRemoteJWKGetter,
  getCrypto,
  getCryptoSubtle,
  getRandomBytes,
  sha256,
  verifyIdToken,
}

const encoding = {
  decodeState,
  encodeState,
  fromBase64,
  textDecoder,
  textEncoder,
  toBase64,
  toUrlEncodedBase64,
  stringFromBuffer,
}

export {default as getSortedScope} from './getSortedScope'
export {default as getWindow} from './getWindow'
export {default as objectFromEntries} from './objectFromEntries'
export {default as objectFromURLSearchParams} from './objectFromURLSearchParams'
export {default as objectToKey} from './objectToKey'
export {default as retry} from './retry'
export {default as uniqueElementsFromArray} from './uniqueElementsFromArray'
export {crypto, encoding}
