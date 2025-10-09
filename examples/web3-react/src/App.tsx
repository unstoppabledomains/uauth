import React, { useState } from 'react'
import ConnectorCard from './components/ConnectorCard';
import connectors from './connectors'
import { ConnectionStatuses } from './types';

const App: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatuses>(ConnectionStatuses.DISCONNECTED)

  return (
    <div
        style={{
          fontFamily: 'Inter, sans-serif',
        }}
      >
      <div
        style={{
          fontSize: '3rem',
          padding: '2rem 5rem',
          marginBottom: '1rem',
          background: '#ececec',
        }}
      >
        {connectionStatus}
      </div>
      <div>
        {Object.keys(connectors).map((v, i) => (
          <ConnectorCard key={i} name={v} state={connectionStatus} setState={setConnectionStatus} connector={connectors[v][0]} hooks={connectors[v][1]} />
        ))}
      </div>
    </div>
  )
}

export default App
