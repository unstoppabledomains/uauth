import getCrypto from './getCrypto'

const getRandomBytes = (length: number): Uint8Array =>
  getCrypto().getRandomValues(new Uint8Array(length))

export default getRandomBytes
