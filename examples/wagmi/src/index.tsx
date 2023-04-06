import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { publicProvider } from '@wagmi/core/providers/public'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import UauthWagmiConnector from './lib/UauthWagmiConnector'

console.log("INITIALIZING WITH CLIENT ID:");
console.log(process.env.REACT_APP_CLIENT_ID);

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.REACT_APP_WC_PROJECT_ID) {
  throw new Error('You need to provide REACT_APP_WC_PROJECT_ID env variable')
}
// const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// 2. Configure wagmi client
const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()],
)

const connector = new UauthWagmiConnector({
  chains,
  options: {
    clientID: process.env.REACT_APP_CLIENT_ID!,
    redirectUri: process.env.REACT_APP_REDIRECT_URI!,
    // Scope must include openid and wallet
    scope: 'openid wallet',
  }
})
const wagmiClient = createClient({
  autoConnect: true,
  connectors: [connector],
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
