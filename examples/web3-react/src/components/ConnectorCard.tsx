import { Dispatch, SetStateAction, useEffect, useState } from 'react'
// import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'
import { Status } from './Status'
import { Accounts } from './Account'
import { AsyncConnector, ConnectionStatuses } from '../types'
import { Connector } from '@web3-react/types'

interface Props {
  name: string;
  connector: AsyncConnector;
  hooks: Web3ReactHooks;
  state: ConnectionStatuses;
  setState: Dispatch<SetStateAction<ConnectionStatuses>>;
}

export default function ConnectorCard({
  name,
  connector,
  hooks,
  state,
  setState,
}: Props) {

  const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } = hooks

  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const provider = useProvider()

  const [error, setError] = useState(undefined)

  const handleToggleConnect = () => {
    if (isActive) {
      if (connector?.deactivate) {
        void connector.deactivate()
      } else {
        void connector.resetState()
      }
      setState(ConnectionStatuses.DISCONNECTED);
    }
    else if (!isActivating) {
      setState(ConnectionStatuses.CONNECTING);

      connector
        .activate(1)
        .then(() => {
          setError(undefined);
          setState(ConnectionStatuses.CONNECTED);
        })
        .catch((e: SetStateAction<undefined>) => {
          setState(ConnectionStatuses.DISCONNECTED);
          setError(e);
        })
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '1px solid',
        borderRadius: '1rem',
      }}
    >
      <b>{name}</b>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} error={error} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        Chain Id: <b>{chainId}</b>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Accounts accounts={accounts} provider={provider} />
      </div>
      
      <button 
        onClick={handleToggleConnect}
        disabled={state === ConnectionStatuses.CONNECTED && !isActive}
        >
        {isActive ? "Disconnect" : "Connect"}
      </button>

    </div>
  )
}