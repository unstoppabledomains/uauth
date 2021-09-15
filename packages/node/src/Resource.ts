import {IncomingMessage} from 'http'
import {Client} from '.'

class Resource extends Client {
  async resource(req: IncomingMessage) {
    const authorization = req.headers.authorization

    if (!authorization) {
      throw new Error('no authorization present')
    }

    if (!authorization.startsWith('Unstoppable ')) {
      throw new Error('invalid authorization scheme, should be "Unstoppable"')
    }

    if (!authorization.startsWith('Unstoppable ')) {
      throw new Error('invalid authorization scheme, should be "Unstoppable"')
    }

    const [domain, access_token] = authorization.substring(12).split(' ', 1)

    const issuerMetadata = await this.issuerResolver.resolve(
      domain,
      this.options.fallbackIssuer,
    )

    const response = await fetch(issuerMetadata.issuer + '/introspect', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    }).then(resp => resp.json())

    if (!response.active) {
      throw new Error('invalid token')
    }
  }
}
