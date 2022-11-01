import React, { useState } from 'react'
import ConnectorCard from './components/ConnectorCard';
import connectors from './connectors'
import { AsyncConnector, ConnectionStatuses } from './types';

const App: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatuses>(ConnectionStatuses.DISCONNECTED)

  return (
    <>
      <div>
        {connectionStatus}
      </div>
      <div>
        {Object.keys(connectors).map(v => (
          <ConnectorCard name={v} state={connectionStatus} setState={setConnectionStatus} connector={connectors[v].connector as AsyncConnector} hooks={connectors[v].hooks} />
        ))}
      </div>
    </>
  )
}

export default App
