import {IssuerMetadata} from 'openid-client'

export interface JRDLink {
  // URI
  rel: string

  // URI used for looking it up if rel is not some URL.
  href?: string

  // Media type (MIME type), See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  type?: string

  // Mapping of language to title, with default being a fallback language
  // Uses Language Tags, See: https://datatracker.ietf.org/doc/html/rfc1766
  titles?: Record<string, string>
}

export interface JRDDocument {
  // URI describing the subject of the document
  subject: string

  // URIs the document might also refer to
  aliases?: string[]

  // Mapping of URIs to arbitrary strings
  properties?: Record<string, string>

  // List of JRDLink objects
  links?: JRDLink[]

  // Date at witch this document expires
  expires?: number | string
}

export interface IPFSResolver {
  // See this doc for more: https://docs.ipfs.io/how-to/address-ipfs-on-web/#native-urls
  resolve(url: string): Promise<string>
}

export interface DomainResolver {
  records(domain: string, keys: string[]): Promise<Record<string, string>>
}

export interface WebFingerResolver {
  resolve(domain: string, user: string, rel: string): Promise<JRDDocument>
}

export interface IssuerResolver {
  resolve(username: string): Promise<IssuerMetadata>
}

type MaybePromise<T> = Promise<T> | T

// Identical to a partial Map<string, string>
export interface Cache {
  get(key: string): MaybePromise<string | undefined>
  set(key: string, value: string): MaybePromise<Cache>
  delete(key: string): MaybePromise<boolean>
  entries(): MaybePromise<IterableIterator<[string, string]>>
  clear(): MaybePromise<void>
}
