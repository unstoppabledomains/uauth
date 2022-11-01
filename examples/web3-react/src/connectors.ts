import {CoolConnector} from '@uauth/web3-react'
import {initializeConnector} from '@web3-react/core'
import {MetaMask} from '@web3-react/metamask'
import {WalletConnect} from '@web3-react/walletconnect'
import {AsyncConnector, ConnectorManager} from './types';

const [metaMaskConnector, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }));
export const metaMask = {connector: metaMaskConnector, hooks: metaMaskHooks};

const rbcObj = {
  1: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID!}` 
};
const [walletConnectConnector, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: rbcObj,
        qrcode: true,
      },
    })
)
export const walletConnect = {connector: walletConnectConnector, hooks: walletConnectHooks};

const [uauthConnector, uauthHooks] = initializeConnector<CoolConnector>(
  (actions) => new CoolConnector({
    actions,
    options: {
      clientID: process.env.REACT_APP_CLIENT_ID!,
      redirectUri: process.env.REACT_APP_REDIRECT_URI!,
      // Scope must include openid and wallet
      scope: 'openid wallet',

      // Injected and walletconnect connectors are required
      connectors: {injected: metaMask.connector, walletconnect: walletConnect.connector}
    },
  })
)
export const uauth = {connector: uauthConnector, hooks: uauthHooks};

const connectors: Record<string, ConnectorManager> = {
  metaMask,
  walletConnect,
  uauth,
}

export default connectors
