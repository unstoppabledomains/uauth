import React, {useEffect} from 'react'
import {useWeb3Modal} from './Web3ModalContext'

const App: React.FC = () => {
  const {connect, disconnect, isConnected, isLoading, address, error, user} =
    useWeb3Modal()

  const handleConnect = async () => {
    await connect()
  }

  const handleLogout = () => {
    disconnect()
  }

  useEffect(() => {
    if (error) {
      alert(String(error))
    }
  }, [error])

  if (isLoading) {
    return <>Loading...</>
  }

  if (isConnected) {
    return (
      <>
        <div>Connected to {address}</div>
        <button onClick={handleLogout}>Logout</button>
      </>
    )
  }

  return <button onClick={handleConnect}>Connect</button>
}

export default App
