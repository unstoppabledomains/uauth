import {useWeb3React} from '@web3-react/core'
import React, {useEffect, useState} from 'react'
import {Redirect} from 'react-router-dom'
import {uauth} from './connectors'

const CallbackPage: React.FC = () => {
  const {activate} = useWeb3React()
  const [redirectTo, setRedirectTo] = useState<string>()

  useEffect(() => {
    // Callback and login using web3-react
    uauth
      .callbackAndActivate({activate})
      .then(() => {
        setRedirectTo('/')
      })
      .catch(error => {
        console.error('callback error:', error)
        alert('An error occured')
        setRedirectTo('/')
      })
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return <>Callback...</>
}

export default CallbackPage
