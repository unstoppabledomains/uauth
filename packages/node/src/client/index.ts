import {RequestHandler} from 'express'
import MemoryDomainResolver from '../../../common/src/MemoryDomainResolver'
import DefaultIPFSResolver from '../common/DefaultIPFSResolver'
import MemoryCache from '../common/MemoryCache'
import {Cache, DomainResolver, IPFSResolver} from '../types'

class Client {
  public ttl?: number
  public config: any

  static async init(): Promise<Client> {
    return new Client()
  }

  constructor() {}
}

interface WebFingerByRequest {
  host: string
}
interface WebFingerByReference {
  uri: string
}
interface WebFingerByValue {
  value: string
}

// function isJRD(json: any): json is JRD {
//   return true
// }

class ClientFactory {
  constructor(
    //
    public domainResolver: DomainResolver,
    public ipfsResolver: IPFSResolver,
    public cache: Cache,
  ) {}

  async discover(username: string): Promise<Client> {
    const [user, domain] = username.split('@', 1)

    const rel = 'http://openid.net/specs/connect/1.0/issuer'

    const issuerDiscoveryKey = `webfinger.${user}.${rel}`

    const [rawWebFinger] = await this.domainResolver.resolve(domain, [
      issuerDiscoveryKey,
    ])

    const webfinger = JSON.parse(rawWebFinger)

    let json: any
    if (webfinger.host) {
      json = await fetch(
        '/.well-known/webfinger?' +
          new URLSearchParams({
            resource: `acct:${user}@${domain}`,
            rel,
          }).toString(),
        {
          headers: {Host: webfinger.host},
        },
      ).then(resp =>
        resp.ok ? resp.json() : Promise.reject(new Error('bad response')),
      )
    } else if (webfinger.uri) {
      const url = new URL(webfinger.uri)

      switch (url.protocol) {
        case 'http:':
        case 'https:': {
          json = await fetch(url.toString(), {
            headers: {
              'Content-Type': '',
            },
          })
          break
        }
        case 'ipfs:': {
          const raw = await this.ipfsResolver.resolve(
            url.hostname,
            url.pathname,
          )
          json = JSON.parse(raw)
          break
        }
        case 'ipns:':
        case 'swarm:':
        default: {
          throw new Error('uri scheme not supported')
        }
      }
    } else if (webfinger.value) {
      json = JSON.parse(webfinger.value)
    } else {
      throw new Error('bad entry')
    }

    if (!isJRD(json)) {
      throw new Error('resolved document not jrd')
    }

    const jrd: JRD = json

    return Client.init()
  }

  async resolveJRD(object: any): JRD {
    throw new Error('')
  }

  middleware(): RequestHandler {
    return () => {
      //
    }
  }
}

function uploadToIPFS(json: any): Promise<void> {
  const formData = new FormData()

  formData.append(
    'file',
    new Blob([JSON.stringify(json)], {type: 'application/json'}),
    'webfinger.json',
  )

  return fetch('https://ipfs.infura.io:5001/api/v0/add', {
    method: 'POST',
    body: formData,
  }).then(resp =>
    resp.ok
      ? Promise.resolve()
      : Promise.reject(new Error('failed to upload to IPFS')),
  )
}

if (module === require.main) {
  ;(async () => {
    // const web3Provider = new Web3.providers.HttpProvider(
    //   'https://mainnet.infura.io/v3/213fff28936343858ca9c5115eff1419',
    //   {
    //     headers: [
    //       {
    //         name: 'Authentication',
    //         value: 'Basic :63a607f3f14f4aecb471fff87f481ef9',
    //       },
    //     ],
    //   },
    // )

    const memoryDomainResolver = new MemoryDomainResolver()

    memoryDomainResolver.set('domain.crypto', {
      'webfinger.alice.http://openid.net/specs/connect/1.0/issuer':
        '{"host":"https://localhost:8080"}',
    })

    const memoryCache = new MemoryCache()
    const ipfsResolver = new DefaultIPFSResolver()

    const client = new ClientFactory(
      memoryDomainResolver,
      ipfsResolver,
      memoryCache,
    )
  })().catch(console.error)
}

// const sdk = new SDK()

// type AddressTypeHint =
//   | 'web3'
//   | 'trezor'
//   | 'ledger'
//   | 'walletconnect'
//   | 'walletlink'
//   | 'mewconnect'
//   | 'formatic'
//   | 'portis'
//   | 'oob'

// sdk.login('web3', addr => {
//   const provider =
//     (window as any).ethereum ||
//     (window as any).web3.currentProvider ||
//     (window as any).BinanceChain

//   if (!provider) {
//     throw new Error('fail')
//   }

//   //
// })

// sdk.on('login', (addr: string, addr_type_hint: AddressTypeHint) => {
//   switch (addr_type_hint) {
//     case 'web3': {
//       break
//     }
//     case 'trezor': {
//       break
//     }
//     case 'ledger': {
//       break
//     }
//     case 'walletconnect': {
//       break
//     }
//     case 'walletlink': {
//       break
//     }
//     case 'mewconnect': {
//       break
//     }
//     case 'formatic': {
//       break
//     }
//     case 'portis': {
//       break
//     }
//     case 'oob': {
//       break
//     }
//     default:
//   }
// })
