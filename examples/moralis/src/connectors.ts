// Instanciate your other connectors.
import {UAuthMoralisConnector} from '@uauth/moralis'

export const injected = {}

export const walletconnect = {provider: 'walletconnect'}

UAuthMoralisConnector.setUAuthOptions({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  // clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  // postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
  fallbackIssuer: process.env.REACT_APP_FALLBACK_ISSUER!,

  // Scope must include openid and wallet
  scope: 'openid wallet',

  // Injected and walletconnect connectors are required
  connectors: {injected, walletconnect},
})

const uauth = {connector: UAuthMoralisConnector}

const connectors: Record<string, any> = {
  injected,
  walletconnect,
  uauth,
}

export default connectors
