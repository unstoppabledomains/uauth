import getCrypto from './getCrypto'

//safari 10.x uses webkitSubtle
const getCryptoSubtle = () =>
  getCrypto().subtle ?? (getCrypto() as any).webkitSubtle

export default getCryptoSubtle
