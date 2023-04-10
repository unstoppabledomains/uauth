import {useState} from 'react'
import {useAccount, useConnect, useDisconnect} from 'wagmi'

export default function CustomButton() {
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const label = isConnected ? 'Disconnect' : 'Connect Custom'

  const onClick = async () => {
    setLoading(true);
    if (isConnected) {
      await disconnect();
    }
    else {
      await connect({connector: connectors[0]});
    }
    setLoading(false);
  };

  return (
    <div>
      {isConnected && (
        <div>Connected address: {address}</div>
      )}
      <button onClick={onClick} disabled={loading}>
        {loading ? 'Loading...' : label}
      </button>
    </div>
  )
}
