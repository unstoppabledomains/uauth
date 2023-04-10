import React from 'react'
import CustomButton from './components/CustomButton';

const App: React.FC = () => {

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
        Wagmi Uauth Connector <i style={{color: '#0d67fe'}}>Login with Unstoppable</i>
      </div>
      <div>
        {/* Custom button */}
        <CustomButton />
      </div>
    </div>
  )
}

export default App
