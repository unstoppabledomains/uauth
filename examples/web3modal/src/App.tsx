import * as UAuthWeb3Modal from '@uauth/web3modal'
import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import CallbackPage from './CallbackPage'
import HomePage from './HomePage'
import providerOptions from './providerOptions'
import {Web3ModalProvider} from './Web3ModalContext'

const App: React.FC = () => {
  return (
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
  )
}

export default App
