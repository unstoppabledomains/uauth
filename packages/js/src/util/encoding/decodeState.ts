import fromBase64 from './fromBase64'

const decodeState = <T>(state: string): T => {
  const [, v, ...b] = state.split('.')

  if (b.length > 0) {
    throw new Error('failed to decode state')
  }

  return v?.length > 0
    ? JSON.parse(decodeURIComponent(/* unescape */ fromBase64(v)))
    : undefined
}

export default decodeState
