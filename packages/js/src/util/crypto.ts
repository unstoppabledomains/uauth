import {CodeChallengeMethod} from '../types'

//ie 11.x uses msCrypto
export const getCrypto = () =>
  (window.crypto || (window as any).msCrypto) as Crypto

//safari 10.x uses webkitSubtle
export const getCryptoSubtle = () =>
  getCrypto().subtle || (getCrypto() as any).webkitSubtle

export const getRandomBytes = (length: number) =>
  getCrypto().getRandomValues(new Uint8Array(length))

const pkceMask =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.'

const generateCodeVerifier = (length: number) => {
  return Array.from(getRandomBytes(length))
    .map(v => pkceMask[v % pkceMask.length])
    .join('')
}

export const generateCodeChallengeAndVerifier = async (
  length = 43,
  method: CodeChallengeMethod = 'S256',
): Promise<{verifier: string; challenge: string}> => {
  const verifier = generateCodeVerifier(length)

  switch (method) {
    case 'plain':
      return {verifier, challenge: verifier}
    case 'S256':
      return {verifier, challenge: toUrlEncodedBase64(await sha256(verifier))}
    default:
      throw new Error('bad challenge method')
  }
}

export const sha256 = async (s: string): Promise<ArrayBuffer> => {
  const digestOp: any = getCryptoSubtle().digest(
    {name: 'SHA-256'},
    new TextEncoder().encode(s),
  )

  // This is for legacy IE Hashing
  if ((window as any).msCrypto) {
    return new Promise((res, rej) => {
      digestOp.oncomplete = (e: any) => res(e.target.result)
      digestOp.onerror = (e: ErrorEvent) => rej(e.error)
      digestOp.onabort = () => rej('The digest operation was aborted')
    })
  }

  return await digestOp
}

export const toBase64 = (buf: ArrayBuffer) => {
  return window.btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))))
}

export const toUrlEncodedBase64 = (buf: ArrayBuffer) => {
  return encodeURIComponent(toBase64(buf))
}

export const textEncoder = new TextEncoder()
export const textDecoder = new TextDecoder()
