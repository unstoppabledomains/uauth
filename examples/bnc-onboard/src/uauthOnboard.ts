import UAuthBncOnboard from '@uauth/bnc-onboard'

const uauthOnboard = new UAuthBncOnboard({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
  scope: 'openid wallet',
})

export default uauthOnboard
