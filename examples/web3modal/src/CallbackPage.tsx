import React, {useEffect, useState} from 'react'
import {Redirect, RouterProps} from 'react-router-dom'
import {useWeb3Modal} from './Web3ModalContext'

const CallbackPage: React.FC<RouterProps> = props => {
  const {connect, uauth} = useWeb3Modal()
  const [redirectTo, setRedirectTo] = useState<string>()

  useEffect(() => {
    uauth
      .loginCallback()
      .then(async () => {
        console.log('Token exchanged!')
        await connect('custom-uauth')
        setRedirectTo('/')
      })
      .catch(error => {
        alert('Failed to connect!')
        console.error('error:', error)
        setRedirectTo('/')
      })
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return <>Callback...</>
}

export default CallbackPage
