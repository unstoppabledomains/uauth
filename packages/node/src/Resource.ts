import {
  DomainResolver,
  IssuerResolver,
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
} from '@uauth/common'
import {IncomingMessage} from 'http'
import Resolution from '@unstoppabledomains/resolution'

type ResourceConstructorOptions = Partial<ResourceOptions>

interface ResourceOptions {
  resolution: DomainResolver
  fallbackIssuer: string
  createIpfsUrl: (cid: string, path: string) => string
}

class Resource {
  public options: ResourceOptions
  public issuerResolver: IssuerResolver

  constructor(options: ResourceConstructorOptions) {
    options.fallbackIssuer =
      options.fallbackIssuer || 'https://auth.unstoppabledomains.com'
    options.resolution = options.resolution || new Resolution()

    this.options = options as ResourceOptions

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this.issuerResolver = new DefaultIssuerResolver({
      webfingerResolver: new DefaultWebFingerResolver({
        ipfsResolver: new DefaultIPFSResolver((...args) =>
          (this.options.createIpfsUrl || DefaultIPFSResolver.defaultCreateUrl)(
            ...args,
          ),
        ),
        domainResolver: {
          records(
            domain: string,
            keys: string[],
          ): Promise<Record<string, string>> {
            return self.options.resolution.records(domain, keys)
          },
        },
      }),
    })
  }

  async validateIncomingMessage(req: IncomingMessage): Promise<void> {
    const authorization = req.headers.authorization

    if (!authorization) {
      throw new Error('no authorization present')
    }

    if (!authorization.startsWith('Unstoppable ')) {
      throw new Error('invalid authorization scheme, should be "Unstoppable"')
    }

    const [domain, access_token] = authorization.substring(12).split(' ', 1)

    const issuerMetadata = await this.issuerResolver.resolve(
      domain,
      this.options.fallbackIssuer,
    )

    const a = await this.options.resolution.records(domain, [''])
  }
}

export default Resource
