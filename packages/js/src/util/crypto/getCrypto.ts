import getWindow from '../getWindow'

//ie 11.x uses msCrypto
const getCrypto = () =>
  (getWindow().crypto ?? (getWindow() as any).msCrypto) as Crypto

export default getCrypto
