import toBase64 from './toBase64'

const toUrlEncodedBase64 = (str: string) => {
  return toBase64(str)
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export default toUrlEncodedBase64
