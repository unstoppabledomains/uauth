import React, {useEffect, useState} from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import * as modal from '../../modal/build/index.modern'
import '../../modal/src/Modal.css'
import {popup} from './popup'
import uauth from './uauth'
import Widget from './widget'
import Button from './widget/Button'
import './widget/index.css'
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          path="/modal-test"
          component={() => {
            const [domain, setDomain] = useState('')

            if (!domain) {
              return (
                <Button
                  onClick={() => {
                    ;(async () => {
                      setDomain(
                        await modal.open(async (domain: string) => {
                          await new Promise(r => setTimeout(r, 1000))
                          return 'redirect_uri_for_' + domain
                        }),
                      )
                    })()
                  }}
                />
              )
            }

            return <div>Domain: {domain}</div>
          }}
        />

        <Route
          path="/popup"
          component={() => {
            const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
              e.preventDefault()
              popup()
            }

            return (
              <div>
                <button onClick={onClick}>Popup!</button>
              </div>
            )
          }}
        />
        <Route
          path="/callback"
          component={() => {
            const [response, setResponse] = useState<any>()
            const [error, setError] = useState<Error>()

            useEffect(() => {
              ;(async () => {
                setResponse(
                  Object.fromEntries(
                    new URLSearchParams(window.location.search).entries(),
                  ),
                )

                const {authorization} = await uauth.loginCallback({
                  url: window.location.href,
                })

                const wallet = await uauth.connectPreferedWallet(
                  authorization.idToken.sub,
                  '',
                )

                setResponse({
                  authorization,
                  account: await wallet.account(),
                  chainId: await wallet.chainId(),
                  clientVersion: await wallet.clientVersion(),
                })
              })()
            }, [])

            return (
              <div>
                <pre>{JSON.stringify(error || response, null, 2)}</pre>
              </div>
            )
          }}
        />

        <Route
          exact
          path="/"
          component={() => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
              }}
            >
              <div
                style={{
                  border: '1px solid #eee',
                  padding: '1rem',
                  borderRadius: '1rem',
                }}
              >
                {['Metamask', 'WalletConnect', 'Coinbase Wallet', '...'].map(
                  v => (
                    <div
                      key={v}
                      style={{
                        width: 'calc(100%- 2rem)',
                        margin: '0 0 1rem',
                        border: '3px solid #eee',
                        padding: '1rem',
                        borderRadius: '.5rem',
                        color: '#888',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 300,
                      }}
                    >
                      {v}
                    </div>
                  ),
                )}
                <Widget />
              </div>
            </div>
          )}
        />

        <Route
          exact
          path="/small"
          component={() => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: '10vh',
                width: '98vw',
              }}
            >
              <Widget small />
            </div>
          )}
        />
      </Switch>
    </BrowserRouter>
  )
}

export default App
