import getWindow from '../getWindow'
import getCryptoSubtle from './getCryptoSubtle'

const sha256 = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  const digestOp: any = getCryptoSubtle().digest({name: 'SHA-256'}, buf)

  // This is for legacy IE Hashing
  if ((getWindow() as any).msCrypto) {
    return new Promise((res, rej) => {
      digestOp.oncomplete = (e: any) => res(e.target.result)
      digestOp.onerror = (e: ErrorEvent) => rej(e.error)
      digestOp.onabort = () => rej('The digest operation was aborted')
    })
  }

  return await digestOp
}

export default sha256
