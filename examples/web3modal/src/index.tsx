import * as UAuthWeb3Modal from '@uauth/web3modal'
import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import CallbackPage from './CallbackPage'
import HomePage from './HomePage'
import providerOptions from './providerOptions'
import {Web3ModalProvider} from './Web3ModalContext'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Web3ModalProvider
      cacheProvider={true}
      providerOptions={providerOptions}
      onNewWeb3Modal={UAuthWeb3Modal.registerWeb3Modal}
    >
      <BrowserRouter>
        <Switch>
          <Route path="/callback" component={CallbackPage} />
          <Route component={HomePage} />
        </Switch>
      </BrowserRouter>
    </Web3ModalProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
