import {JRDDocument, JRDLink} from './types'

export function isJRDLink(json: any): json is JRDLink {
  return true
}

export function isJRD(json: any): json is JRDDocument {
  return true
}
