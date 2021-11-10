import {Web3Provider} from '@ethersproject/providers'
import {Web3ReactProvider} from '@web3-react/core'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
