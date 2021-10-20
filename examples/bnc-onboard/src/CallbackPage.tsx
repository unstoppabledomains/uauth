import React, {useEffect, useState} from 'react'
import {Redirect, RouteProps} from 'react-router'
import {useOnboard} from './OnboardContext'
import uauthOnboard from './uauthOnboard'

const CallbackPage: React.FC<RouteProps> = () => {
  const {onboard} = useOnboard()
  const [redirectTo, setRedirectTo] = useState<string>()

  useEffect(() => {
    ;(async () => {
      await uauthOnboard.callbackAndWalletSelect({onboard})
      setRedirectTo('/')
    })().catch(error => {
      console.error(error)
      setRedirectTo('/')
    })
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return <>Callback...</>
}

export default CallbackPage
