import UAuth from '../../packages/js/src'

/**
 * Instanciation
 */

const uauth = new UAuth({
  clientID: 'my_client_id',
  // clientSecret?: We don't have it, but we probably will once we deploy more than the one UAuth server
  redirectUri: 'https://my-client.com/callback',
  // scope: Defaults to 'openid' which just giving access to the the domain name
  // resolution: Optional resolution library instance
  wallets: {
    // Wallets need to connect to the wallet and return the provider.
    web3: simpleWeb3,
    default: () => {
      window.location.assign('/connect-wallet')
    },
  },
})

function simpleWeb3() {
  window.ethereum.enable()
  return window.ethereum
}

async function simpleImportWeb3() {
  return (await import('eth-provider'))()
}

async function binanceWeb3() {
  const provider = window.BinanceChain || window.ethereum
  await provider.enable()
  return provider
}

/**
 * Login
 *
 * Redirects browser to authorization server. Should be placed on a button.
 */

uauth
  .login({
    username: 'domain.crypto',
    // async beforeRedirect() {
    //   // Do some action before the window.location.assign call
    //   alert("I'm redirecting...")
    //   return
    // },
  })
  .catch(error => {
    // some error occured
  })

/**
 * Potential Idea!
 *
 * Login with popup. Same as login, but must be attached to a click/submit event
 * in order for browsers not to block.
 */

/**
 * Login Callback
 */

uauth
  .loginCallback()
  .then(user => {
    console.log(user)
  })
  .catch(error => {
    // some error occured
  })

/**
 * Access User info
 */

uauth
  .user()
  .then(user => {
    console.log(user)
  })
  .catch(error => {
    window.location.assign('/login')
    // some error occured
  })

/**
 * Logout
 */

// Needs polishing

uauth.logout().catch(error => {
  // some error occured
})
