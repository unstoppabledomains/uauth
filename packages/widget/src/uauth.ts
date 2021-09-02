import {MemoryDomainResolver} from '@uauth/common'
import UAuth from '@uauth/js'

const memoryDomainResolver = new MemoryDomainResolver()

memoryDomainResolver.set('domain.crypto', {
  'webfinger..http://openid.net/specs/connect/1.0/issuer': JSON.stringify({
    value: JSON.stringify({
      subject: 'domain.crypto',
      links: [
        {
          rel: 'http://openid.net/specs/connect/1.0/issuer',
          href: 'http://localhost:8081',
        },
      ],
    }),
  }),
})

const uauth = new UAuth({
  // clientID: 'authorization_code_test_client',
  clientID: 'g8THraEOlQjDEAvXI4OT1+zIoafk0Tt+so1EZhGZ6mE=',
  clientSecret: 'sHzNoZIH86ZCGj+1AieM2hKS1OevUNha40Eje0D8XoQ=',
  redirectUri: 'https://example.com/callback', // 'http://localhost:5000/callback',
  resolution: memoryDomainResolver,
  scope: 'openid email wallet',
  fallbackIssuer: 'http://localhost:8081',
})

export default uauth

// Access to fetch at 'https://example.com/callback?code=FaTFbGYwxLsITnctQk8Z-d0bxXf9iNM942CfGYwf3CK&state=hO8QyENnO2CdO48x9i%2BPuXRC20kxx1Gv3hBPkGxUgzU%3D.'
// (redirected from 'http://localhost:8081/interaction/dyBlWLuGjLG16TkWiVIvv/login') from origin 'http://localhost:8081' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
// If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
