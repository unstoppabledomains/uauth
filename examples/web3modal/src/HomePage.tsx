import React, {useEffect} from 'react'
import {RouterProps} from 'react-router-dom'
import {useWeb3Modal} from './Web3ModalContext'

const HomePage: React.FC<RouterProps> = () => {
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
        <div>Logged in as: {address}</div>
        <pre>User: {JSON.stringify(user, null, 2)}</pre>
        <button onClick={handleLogout}>Logout</button>
      </>
    )
  }

  return <button onClick={handleConnect}>Connect</button>
}

export default HomePage
