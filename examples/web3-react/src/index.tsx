import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {Web3Provider} from '@ethersproject/providers'
import {Web3ReactProvider} from '@web3-react/core'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import CallbackPage from './CallbackPage'
import HomePage from './HomePage'

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <Switch>
          <Route path="/callback" component={CallbackPage} />
          <Route component={HomePage} />
        </Switch>
      </BrowserRouter>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
