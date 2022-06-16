import UAuthBncOnboard from '@uauth/bnc-onboard'
import initOnboard from 'bnc-onboard'
import React, {useEffect, useMemo, useState} from 'react'
import ReactDOM from 'react-dom'

const uauthOnboard = new UAuthBncOnboard({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  scope: 'openid wallet',
})

const uauthWalletModule = uauthOnboard.module({
  preferred: true,
  walletconnect: {
    infuraId: process.env.REACT_APP_INFURA_ID!,
  },
})

const App: React.FC = () => {
  const [address, setAddress] = useState<string>()
  const [wallet, setWallet] = useState<any>()

  const onboard = useMemo(
    () =>
      initOnboard({
        dappId: process.env.REACT_APP_ONBOARD_KEY!,
        networkId: 1,
        walletSelect: {
          wallets: [
            {walletName: 'metamask', preferred: true},
            {
              walletName: 'walletConnect',
              preferred: true,
              infuraKey: process.env.REACT_APP_INFURA_ID!,
            },
            uauthWalletModule,
          ],
        },
        subscriptions: {
          address: setAddress,
          wallet: wallet => {
            if (wallet) {
              window.localStorage.setItem('selectedWallet', wallet.name!)
            }

            setWallet(wallet)
          },
        },
      }),
    [],
  )

  useEffect(() => {
    const previouslySelectedWallet =
      window.localStorage.getItem('selectedWallet')
    if (previouslySelectedWallet != null) {
      if (previouslySelectedWallet === 'Unstoppable') {
        uauthOnboard
          .getUAuth()
          .then(async uauth => {
            await uauth.user()
            await onboard.walletSelect('Unstoppable')
          })
          .catch(() => {
            window.localStorage.removeItem('selectedWallet')
          })
      } else {
        onboard.walletSelect(previouslySelectedWallet)
      }
    }
  }, [])

  const handleConnect = async () => {
    try {
      await onboard.walletSelect()
      await onboard.walletCheck()
    } catch (error) {
      alert(String(JSON.stringify(error)))
      console.error(error)
    }
  }

  const handleLogout = () => {
    if (wallet.name === 'Unstoppable') {
      uauthOnboard.getUAuth().then(uauth => uauth.logout())
    }
    onboard.walletReset()
  }

  if (address) {
    console.log('wallet:', wallet)
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
