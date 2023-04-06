// import { useWeb3Modal } from '@web3modal/react'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function CustomButton() {
  const [loading, setLoading] = useState(false)
  // const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const label = isConnected ? 'Disconnect' : 'Connect Custom'

  const onClick = async () => {
    console.log("CONNECTING 234");
    console.log(connectors);
    const connection = await connect({connector: connectors[0]});
    console.log("CONNECTED");
    console.log(connection);
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
