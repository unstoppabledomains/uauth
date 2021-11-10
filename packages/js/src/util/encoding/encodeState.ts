import getRandomBytes from '../crypto/getRandomBytes'
import stringFromBuffer from './stringFromBuffer'
import toUrlEncodedBase64 from './toUrlEncodedBase64'

const encodeState = <T>(state: T): string =>
  `${toUrlEncodedBase64(stringFromBuffer(getRandomBytes(32)))}.${
    state == null
      ? ''
      : toUrlEncodedBase64(
          /* escape */ encodeURIComponent(JSON.stringify(state)),
        )
  }`

export default encodeState
