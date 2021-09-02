import {JRDDocument, WebFingerResolver} from './types'

export default class MemoryWebFingerResolver implements WebFingerResolver {
  map = new Map<string, JRDDocument>()

  set(domain: string, user: string, rel: string, document: JRDDocument): void {
    this.map.set(`${domain}.${user}.${rel}`, document)
  }

  async resolve(
    domain: string,
    user: string,
    rel: string,
    fallbackIssuer: string,
  ): Promise<JRDDocument> {
    const jrd = this.map.get(`${domain}.${user}.${rel}`)

    if (!jrd) {
      return {subject: domain, links: [{rel, href: fallbackIssuer}]}
    }

    return jrd
  }
}
