import {UAuthConnector} from '@uauth/web3-react'
import {initializeConnector, Web3ReactHooks} from '@web3-react/core'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import {MetaMask} from '@web3-react/metamask'
import {Connector, Web3ReactStore} from '@web3-react/types';
import {WalletConnect} from '@web3-react/walletconnect'

const mainnetUrl = `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID!}`;

// 
// MetaMask connector
// 
const metaMask = initializeConnector<Connector>((actions) => new MetaMask({ actions }));

// 
// WalletConnect connector
// 
const rbcObj = {
  1: mainnetUrl
};
const walletConnect = initializeConnector<Connector>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: rbcObj,
        qrcode: true,
      },
    })
)

// 
// Coinbase connector
// 
export const coinbase = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: mainnetUrl,
        appName: 'uauth',
      },
    })
)

const uauth = initializeConnector<Connector>(
  (actions) => new UAuthConnector({
    actions,
    options: {
      clientID: process.env.REACT_APP_CLIENT_ID!,
      redirectUri: process.env.REACT_APP_REDIRECT_URI!,
      // Scope must include openid and wallet
      scope: 'openid wallet',

      // Injected/metamask and walletconnect connectors are required
      connectors: {injected: metaMask[0], walletconnect: walletConnect[0]}
    },
  })
)

const connectors: Record<string, [Connector, Web3ReactHooks] | [Connector, Web3ReactHooks, Web3ReactStore]> = {
  "Login with Unstoppable": uauth,
  "MetaMask": metaMask,
  "WalletConnect": walletConnect,
  "Coinbase": coinbase,
}

export default connectors
