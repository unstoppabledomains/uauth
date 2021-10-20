import React from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import CallbackPage from './CallbackPage'
import HomePage from './HomePage'
import './index.css'
import {OnboardProvider} from './OnboardContext'
import uauthOnboard from './uauthOnboard'

ReactDOM.render(
  <React.StrictMode>
    <OnboardProvider
      dappId={process.env.REACT_APP_ONBOARD_KEY!}
      networkId={1}
      walletSelect={{
        wallets: [
          {
            walletName: 'metamask',
            preferred: true,
          },
          {
            walletName: 'walletConnect',
            preferred: true,
            infuraKey: process.env.REACT_APP_INFURA_ID!,
          },
          uauthOnboard.module({
            preferred: true,
            walletconnect: {
              infuraId: process.env.REACT_APP_INFURA_ID!,
            },
          }),
        ],
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route path="/callback" component={CallbackPage} />
          <Route component={HomePage} />
        </Switch>
      </BrowserRouter>
    </OnboardProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
