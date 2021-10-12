import {useWeb3React} from '@web3-react/core'
import {WalletConnectConnector} from '@web3-react/walletconnect-connector'
import React from 'react'
import connectors from './connectors'

const HomePage: React.FC = () => {
  const {active, account, activate, deactivate} = useWeb3React()

  function createConnectHandler(connectorId: string) {
    return async () => {
      try {
        const connector = connectors[connectorId]

        // Taken from https://github.com/NoahZinsmeister/web3-react/issues/124#issuecomment-817631654
        if (
          connector instanceof WalletConnectConnector &&
          connector.walletConnectProvider?.wc?.uri
        ) {
          connector.walletConnectProvider = undefined
        }

        await activate(connector)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleDisconnect() {
    try {
      deactivate()
    } catch (error) {
      console.error(error)
    }
  }

  if (active) {
    return (
      <>
        <div>Connected to {account}</div>
        <button onClick={handleDisconnect}>Disconnect</button>
      </>
    )
  }

  return (
    <>
      {Object.keys(connectors).map(v => (
        <div key={v}>
          <button onClick={createConnectHandler(v)}>Connect to {v}</button>
        </div>
      ))}
    </>
  )
}

export default HomePage
