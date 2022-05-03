import React, {useEffect, useMemo, useState} from 'react'
import ReactDOM from 'react-dom'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import uauthBNCModule from '@uauth/web3-onboard'
import UAuth from '@uauth/js'

const injected = injectedModule()
const uauth = new UAuth({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  fallbackIssuer: process.env.REACT_APP_FALLBACK_ISSUER!,
  scope: 'openid wallet',
})
const uauthOptions = {
  uauth: uauth,
  walletconnect: {
    infuraId: process.env.REACT_APP_INFURA_ID!,
  },
}
const uauthModule = uauthBNCModule(uauthOptions)
const onboard = Onboard({
  wallets: [injected, uauthModule],
  chains: [
    {
      id: '0x1',
      rpcUrl: 'https://mainnet.infura.io/v3/a661f4dea79a4e48981da6bddfb5ef2c',
      token: 'ETH',
      label: 'Metamask',
    },
  ],
})

const App: React.FC = () => {
  const [address, setAddress] = useState<string>()

  const handleConnect = async () => {
    const wallets = await onboard.connectWallet()
    if (wallets.length) {
      setAddress(wallets[0].accounts[0].address)
    }
  }

  const handleLogout = async () => {
    const [primaryWallet] = onboard.state.get().wallets
    console.log('aaa', primaryWallet.label)
    if (primaryWallet.label === 'Unstoppable') {
      uauth.logout()
    }
    onboard.disconnectWallet({label: primaryWallet.label})
    setAddress('')
  }

  if (address) {
    return (
      <>
        <div>Connected to {address}</div>
        <button onClick={handleLogout}>Logout</button>
      </>
    )
  }

  return <button onClick={handleConnect}>Connect</button>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
