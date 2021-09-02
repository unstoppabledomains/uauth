import {IssuerResolver, IssuerResolverOptions} from './types'

export default class DefaultIssuerResolver implements IssuerResolver {
  constructor(public options: IssuerResolverOptions) {}

  async resolve(username: string, fallbackIssuer: string) {
    let user = ''
    let domain: string
    if (username.includes('@')) {
      ;[user, domain] = username.split('@', 1)
    } else {
      domain = username
    }

    const rel = 'http://openid.net/specs/connect/1.0/issuer'

    const jrd = await this.options.webfingerResolver.resolve(
      domain,
      user,
      rel,
      fallbackIssuer,
    )

    const link = jrd.links?.find(v => v.rel === rel)
    if (!link || !link.href) {
      throw new Error('bad jrd')
    }

    const config = await fetch(
      link.href + '/.well-known/openid-configuration',
    ).then(resp =>
      resp.ok
        ? resp.json()
        : Promise.reject(new Error('bad openid-configuration response')),
    )

    return config
  }
}
