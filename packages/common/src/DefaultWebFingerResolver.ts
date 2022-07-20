import {isJRD} from './JRD'
import {JRDDocument, WebFingerRecord, WebFingerResolverOptions} from './types'
import {VERSION} from './version'

const _w = window as any
_w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
_w.UAUTH_VERSION.COMMON = VERSION

export default class DefaultWebFingerResolver {
  constructor(public options: WebFingerResolverOptions) {}

  async resolve(
    domain: string,
    user: string,
    rel: string,
    fallbackIssuer: string,
  ): Promise<JRDDocument> {
    const webfingerKey = `webfinger.${user}.${rel}`

    // console.log('domain:', domain)
    // console.log('webfingerKey:', webfingerKey)

    const records = await this.options.domainResolver.records(domain, [
      webfingerKey,
    ])

    const resource = user ? `acct:${user}@${domain}` : `${domain}`

    // console.log('record value:', records[webfingerKey])

    if (!records[webfingerKey]) {
      return {subject: resource, links: [{rel, href: fallbackIssuer}]}
    }

    const webfingerRecord: WebFingerRecord = JSON.parse(records[webfingerKey])

    // console.log('webfingerRecord:', webfingerRecord)

    let json
    if (typeof webfingerRecord.host === 'string') {
      json = await fetch(
        '/.well-known/webfinger?' +
          new URLSearchParams({resource, rel}).toString(),
        {headers: {Host: webfingerRecord.host}},
      ).then(resp =>
        resp.ok
          ? resp.json()
          : Promise.reject(new Error('bad webfinger response')),
      )
    } else if (typeof webfingerRecord.uri === 'string') {
      const url = new URL(webfingerRecord.uri)

      switch (url.protocol) {
        case 'http:':
        case 'https:': {
          json = await fetch(url.toString()).then(resp =>
            resp.ok
              ? resp.json()
              : Promise.reject(new Error('bad webfinger response')),
          )
          break
        }
        case 'ipfs:': {
          json = JSON.parse(
            await this.options.ipfsResolver.resolve(webfingerRecord.uri),
          )
          break
        }
        case 'ipns:':
        case 'swarm:':
        default: {
          throw new Error('uri scheme not supported')
        }
      }
    } else if (typeof webfingerRecord.value === 'string') {
      json = JSON.parse(webfingerRecord.value)
    } else {
      throw new Error('bad webfinger record')
    }

    if (!isJRD(json)) {
      throw new Error('resolved document not jrd')
    }

    if (json.subject !== resource) {
      throw new Error('resource invalid')
    }

    return json
  }
}
