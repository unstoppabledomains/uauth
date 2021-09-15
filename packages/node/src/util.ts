import {createHash, randomBytes} from 'crypto'

export const getRandomBytes = (length: number) => randomBytes(length)

const pkceMask =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.'

const generateCodeVerifier = (length: number) => {
  return Array.from(getRandomBytes(length))
    .map(v => pkceMask[v % pkceMask.length])
    .join('')
}

export const generateCodeChallengeAndVerifier = async (
  length = 43,
  method = 'S256',
): Promise<{verifier: string; challenge: string}> => {
  const verifier = generateCodeVerifier(length)

  switch (method) {
    case 'plain':
      return {verifier, challenge: verifier}
    case 'S256':
      return {verifier, challenge: toUrlEncodedBase64(sha256(verifier))}
    default:
      throw new Error('bad challenge method')
  }
}

export const sha256 = (s: string): ArrayBuffer => {
  return createHash('sha256').update(new TextEncoder().encode(s)).digest()
    .buffer
}

export const toBase64 = (buf: ArrayBuffer) => {
  return Buffer.from(buf).toString('base64')
}

export const toUrlEncodedBase64 = (buf: ArrayBuffer) => {
  return toBase64(buf).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export const textEncoder = new TextEncoder()
export const textDecoder = new TextDecoder()

export const uniqueElements = (arr: any[]): any[] => Array.from(new Set(arr))

export const getSortedScope = (scope: string) =>
  uniqueElements(scope.trim().split(/\s+/)).sort().join(' ')

export const recordCacheKey = (
  record: Record<string, string | undefined>,
): string => {
  const params = new URLSearchParams(
    Object.entries(record).filter(([, v]) => v != null) as string[][],
  )
  params.sort()
  return params.toString()
}
