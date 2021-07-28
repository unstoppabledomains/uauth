import {MemoryDomainResolver} from '@uauth/common/src'
import UAuth from '@uauth/js/src'

const memoryDomainResolver = new MemoryDomainResolver()

memoryDomainResolver.set('domain.crypto', {
  'webfinger..http://openid.net/specs/connect/1.0/issuer': JSON.stringify({
    value: JSON.stringify({
      subject: 'domain.crypto',
      links: [
        {
          rel: 'http://openid.net/specs/connect/1.0/issuer',
          href: 'http://localhost:8080',
        },
      ],
    }),
  }),
  'authentication.': JSON.stringify({
    addr: '0xb8E77cfF40f2942290C2213505Eb2dE733FAcf4C',
    addr_type_hint: 'web3',
  }),
})

const uauth = new UAuth({
  clientID: 'authorization_code_test_client',
  responseMode: 'query',
  redirectUri: 'http://localhost:5000/callback',
  resolution: memoryDomainResolver,
  scope: 'openid email acct',
  wallets: {
    web3: addr => new UAuth.Wallets.InjectedWallet(),
    // TODO: We might be able to pass the walletconnect and walletlink sessions back as idToken claims...
    //   This might make this flow a little more complicated
    walletconnect: addr => new UAuth.Wallets.WalletConnectWallet(),
  },
})

export default uauth
