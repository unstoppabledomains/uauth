import React from 'react'
import {RouteProps} from 'react-router'
import {useOnboard} from './OnboardContext'

const HomePage: React.FC<RouteProps> = () => {
  const {onboard, address, state} = useOnboard()

  console.log('state:', state)

  const handleConnect = async () => {
    try {
      await onboard.walletSelect()

      await onboard.walletCheck()
    } catch (error) {
      alert(String(JSON.stringify(error)))
      console.error(error)
    }
  }

  if (address) {
    return <>Connected to {address}</>
  }

  return <button onClick={handleConnect}>Connect</button>
}

export default HomePage
