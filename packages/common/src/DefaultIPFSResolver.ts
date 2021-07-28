import {IPFSResolver} from './types'

export default class DefaultIPFSResolver implements IPFSResolver {
  static defaultCreateUrl(cid: string, path: string): string {
    return `https://${cid}.ipns.dweb.link${path.replace(/^\/?/, '/')}`
  }

  constructor(public createURL = DefaultIPFSResolver.defaultCreateUrl) {}

  async resolve(uri: string): Promise<string> {
    let cid: string
    let path: string
    let protocol: string

    if (uri.startsWith('/ipfs/') || uri.startsWith('/ipns/')) {
      protocol = uri.substring(1, 5)
      cid = uri.substring(6).split('/')[0]
      path = uri.substring(6 + cid.length)
    } else {
      const url = new URL(uri)

      if (
        url.hash !== '' ||
        url.password !== '' ||
        url.port !== '' ||
        url.search !== '' ||
        url.username !== ''
      ) {
        throw new Error('invalid ipfs uri')
      }

      protocol = url.protocol.substring(0, 4)
      cid = url.hostname
      path = url.pathname
    }

    if (protocol !== 'ipfs') {
      throw new Error('only ipfs is supported, (not ipns)')
    }

    return fetch(this.createURL(cid, path)).then(resp =>
      resp.ok ? resp.text() : Promise.reject(new Error('bad response')),
    )
  }
}
