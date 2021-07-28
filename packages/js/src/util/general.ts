import {textEncoder, toBase64} from './crypto'

export const uniqueElements = (arr: any[]): any[] => Array.from(new Set(arr))

export const getSortedScope = (scope: string) =>
  uniqueElements(scope.trim().split(/\s+/)).sort().join(' ')

export const recordCacheKey = (record: Record<string, string>): string => {
  const params = new URLSearchParams(Object.entries(record))
  params.sort()
  return params.toString()
}

export const getAuthorizationHeader = (sub: string, access_token: string) => {
  return `Basic ${toBase64(textEncoder.encode(sub + ':' + access_token))}`
}
