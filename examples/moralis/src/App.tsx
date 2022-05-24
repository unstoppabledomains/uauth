import React from 'react'
import {useMoralis} from 'react-moralis'
import connectors from './connectors'

const App: React.FC = () => {
  const {authenticate, account, logout, isAuthenticated} = useMoralis()

  function createConnectHandler(connectorId: string) {
    return async () => {
      try {
        const connector = connectors[connectorId]
        console.log(connector)
        await authenticate(connector)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleDisconnect() {
    try {
      logout()
    } catch (error) {
      console.error(error)
    }
  }

  if (isAuthenticated) {
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
        <button key={v} onClick={createConnectHandler(v)}>
          Connect to {v}
        </button>
      ))}
    </>
  )
}

export default App
