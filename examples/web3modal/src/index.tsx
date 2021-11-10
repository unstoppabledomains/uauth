import * as UAuthWeb3Modal from '@uauth/web3modal'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import providerOptions from './providerOptions'
import {Web3ModalProvider} from './Web3ModalContext'

ReactDOM.render(
  <React.StrictMode>
    <Web3ModalProvider
      cacheProvider={true}
      providerOptions={providerOptions}
      onNewWeb3Modal={UAuthWeb3Modal.registerWeb3Modal}
    >
      <App />
    </Web3ModalProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
