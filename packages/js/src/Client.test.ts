import Client from './Client'
import {Authorization} from './types'

describe('verified account retrieval', () => {
  const client = new Client({
    clientID: 'test-client-id',
    redirectUri: 'test-redirect-uri',
  })

  const authorization: Authorization = {
    accessToken: 'test-access-token',
    expiresAt: 0,
    scope: 'test-scope',
    idToken: {
      __raw: 'test-value',
      acr: 'sig',
      amr: [
        'swk',
        'v1.sig.ethereum.0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      ],
      proof: {
        'v1.sig.ethereum.0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af': {
          message:
            'identity.unstoppabledomains.com wants you to sign in with your Ethereum account:\n0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af\n\nI consent to giving access to: email:optional openid profile social wallet\n\nURI: uns:aaronquirk.x\nVersion: 1\nChain ID: 1\nNonce: 0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a\nIssued At: 2022-09-14T12:27:38.240Z',
          signature:
            '0x92904703de96c57273e03543276b09558f031aad62f9f64e8227c4b0c1e06345206eab884a4b5f1dc7ad7a5442e0abe98f0011493ed1bf0c4406d913b495db741b',
          template: {
            format:
              'identity.unstoppabledomains.com wants you to sign in with your {{ chainName }} account:\n{{ address }}\n\n{{ statement }}\n\nURI: uns:{{ domain }}\n{{ version }}\n{{ chainId }}\nNonce: {{ nonce }}\nIssued At: 2022-09-14T12:27:38.240Z',
            params: {
              address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
              chainId: 'Chain ID: 1',
              chainName: 'Ethereum',
              domain: 'aaronquirk.x',
              issuedAt: '1663158458240',
              nonce:
                '0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a',
              statement:
                'I consent to giving access to: email:optional openid profile social wallet',
              uri: 'uns:aaronquirk.x',
              version: 'Version: 1',
            },
          },
          type: 'onchain',
        },
      },
      sub: 'aaronquirk.x',
      verified_addresses: [
        {
          address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
          proof: {
            message:
              'identity.unstoppabledomains.com wants you to sign in with your Ethereum account:\n0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af\n\nI consent to giving access to: email:optional openid profile social wallet\n\nURI: uns:aaronquirk.x\nVersion: 1\nChain ID: 1\nNonce: 0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a\nIssued At: 2022-09-14T12:27:38.240Z',
            signature:
              '0x92904703de96c57273e03543276b09558f031aad62f9f64e8227c4b0c1e06345206eab884a4b5f1dc7ad7a5442e0abe98f0011493ed1bf0c4406d913b495db741b',
            template: {
              format:
                'identity.unstoppabledomains.com wants you to sign in with your {{ chainName }} account:\n{{ address }}\n\n{{ statement }}\n\nURI: uns:{{ domain }}\n{{ version }}\n{{ chainId }}\nNonce: {{ nonce }}\nIssued At: 2022-09-14T12:27:38.240Z',
              params: {
                address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
                chainId: 'Chain ID: 1',
                chainName: 'Ethereum',
                domain: 'aaronquirk.x',
                issuedAt: '1663158458240',
                nonce:
                  '0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a',
                statement:
                  'I consent to giving access to: email:optional openid profile social wallet',
                uri: 'uns:aaronquirk.x',
                version: 'Version: 1',
              },
            },
            type: 'onchain',
          },
          symbol: 'ETH',
        },
        {
          address: '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
          proof: {
            message:
              'Link Unstoppable Domain aaronquirk.x with secondary wallet.\n    \n    {\n  "domain": "aaronquirk.x",\n  "currency": "SOL",\n  "wallet": "8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y"\n}',
            signature:
              '49ktTtcCLyekEtudofCsWBRFK6wRaaFgEkZhHWrQsStkKu2wTdTeh5cEaZUcCesGoXXaf2EF5FUxPna2SKeZzy7',
            template: {
              format:
                'Link Unstoppable Domain {{ domain }} with secondary wallet.\n    \n    {\n  "domain": "{{ domain }}",\n  "currency": "{{ symbol }}",\n  "wallet": "{{ address }}"\n}',
              params: {
                address: '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
                domain: 'aaronquirk.x',
                symbol: 'SOL',
              },
            },
            type: 'hybrid',
          },
          symbol: 'SOL',
        },
      ],
      wallet_address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      wallet_type_hint: 'web3',
    },
  }

  it('should retrieve the signature account', () => {
    expect.hasAssertions()

    const sigAccount = client.getAuthorizationAccount(authorization)
    expect(sigAccount).toMatchObject({
      address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      message:
        'identity.unstoppabledomains.com wants you to sign in with your Ethereum account:\n0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af\n\nI consent to giving access to: email:optional openid profile social wallet\n\nURI: uns:aaronquirk.x\nVersion: 1\nChain ID: 1\nNonce: 0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a\nIssued At: 2022-09-14T12:27:38.240Z',
      signature:
        '0x92904703de96c57273e03543276b09558f031aad62f9f64e8227c4b0c1e06345206eab884a4b5f1dc7ad7a5442e0abe98f0011493ed1bf0c4406d913b495db741b',
      symbol: 'ETH',
    })
  })

  it('should return undefined signature account if not found', () => {
    expect.hasAssertions()

    const sigAccount = client.getAuthorizationAccount(
      authorization,
      'bad',
      'version',
    )
    expect(sigAccount).toBeUndefined()
  })

  it('should retrieve all verified accounts', () => {
    expect.hasAssertions()

    const sigAccount = client.getVerifiedAccounts(authorization)
    expect(sigAccount).toMatchObject([
      {
        address: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
        message:
          'identity.unstoppabledomains.com wants you to sign in with your Ethereum account:\n0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af\n\nI consent to giving access to: email:optional openid profile social wallet\n\nURI: uns:aaronquirk.x\nVersion: 1\nChain ID: 1\nNonce: 0x002bae3c7ad2a219f22aeff5850b70ab563906c7e0964e66ad5708e6db50b88a\nIssued At: 2022-09-14T12:27:38.240Z',
        signature:
          '0x92904703de96c57273e03543276b09558f031aad62f9f64e8227c4b0c1e06345206eab884a4b5f1dc7ad7a5442e0abe98f0011493ed1bf0c4406d913b495db741b',
        symbol: 'ETH',
      },
      {
        address: '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
        message:
          'Link Unstoppable Domain aaronquirk.x with secondary wallet.\n    \n    {\n  "domain": "aaronquirk.x",\n  "currency": "SOL",\n  "wallet": "8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y"\n}',
        signature:
          '49ktTtcCLyekEtudofCsWBRFK6wRaaFgEkZhHWrQsStkKu2wTdTeh5cEaZUcCesGoXXaf2EF5FUxPna2SKeZzy7',
        symbol: 'SOL',
      },
    ])
  })

  it('should filter verified accounts if requested', () => {
    expect.hasAssertions()

    const sigAccount = client.getVerifiedAccounts(authorization, ['SOL'])
    expect(sigAccount).toMatchObject([
      {
        address: '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
        message:
          'Link Unstoppable Domain aaronquirk.x with secondary wallet.\n    \n    {\n  "domain": "aaronquirk.x",\n  "currency": "SOL",\n  "wallet": "8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y"\n}',
        signature:
          '49ktTtcCLyekEtudofCsWBRFK6wRaaFgEkZhHWrQsStkKu2wTdTeh5cEaZUcCesGoXXaf2EF5FUxPna2SKeZzy7',
        symbol: 'SOL',
      },
    ])
  })

  it('should return empty list if no matching verified accounts exist', () => {
    expect.hasAssertions()

    const sigAccount = client.getVerifiedAccounts(authorization, ['BADONE'])
    expect(sigAccount).toMatchObject([])
  })
})
