import UAuth from '@uauth/js'
import type {NextPage} from 'next'
import {useEffect, useState} from 'react'

const uauth = new UAuth({
  clientID: process.env.NEXT_PUBLIC_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
  scope: 'openid email wallet',
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
})

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [user, setUser] = useState<any>()

  // Check to see if the user is inside the cache
  useEffect(() => {
    setLoading(true)
    uauth
      .user()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Login with a popup and save the user
  const handleLogin = () => {
    setLoading(true)
    if (!uauth) {
      return
    }

    uauth
      .loginWithPopup()
      .then(() => uauth.user().then(setUser))
      .catch(setError)
      .finally(() => setLoading(false))
  }

  // Logout and delete user
  const handleLogout = () => {
    setLoading(true)
    if (!uauth) {
      return
    }

    uauth
      .logout()
      .then(() => setUser(undefined))
      .catch(setError)
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <>Loading...</>
  }

  if (error) {
    console.error(error)
    return <>{String(error.stack)}</>
  }

  if (user) {
    return (
      <>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <button onClick={handleLogout}>Logout</button>
      </>
    )
  }

  return <button onClick={handleLogin}>Login with Unstoppable</button>
}

export default Home
