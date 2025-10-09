import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {default as UAuth} from '@uauth/js'
import {UAuthWagmiConnector} from '@uauth/wagmi'
import {MetaMaskConnector} from '@wagmi/core/connectors/metaMask'
import {WalletConnectConnector} from '@wagmi/core/connectors/walletConnect'
import {publicProvider} from '@wagmi/core/providers/public'
import {configureChains, Connector, createClient, WagmiConfig} from 'wagmi'
import {mainnet} from 'wagmi/chains'

console.log("INITIALIZING WITH CLIENT ID:");
console.log(process.env.REACT_APP_CLIENT_ID);

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.REACT_APP_WC_PROJECT_ID) {
  throw new Error('You need to provide REACT_APP_WC_PROJECT_ID env variable')
}

// 2. Configure wagmi clients
const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()],
)

const uauthClient = new UAuth({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  // Scope must include openid and wallet
  scope: 'openid wallet',
})

const metaMaskConnector = new MetaMaskConnector()
const walletConnectConnector = new WalletConnectConnector({
  options: {
    projectId: process.env.REACT_APP_WC_PROJECT_ID,
  },
})

const uauthConnector = new UAuthWagmiConnector({
  chains,
  options: { 
    uauth: uauthClient,
    metaMaskConnector,
    walletConnectConnector,
   }
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [uauthConnector as any as Connector<any, any, any>, metaMaskConnector, walletConnectConnector],
  provider
})

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root'),
)
