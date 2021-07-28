import {useCallback, useState} from 'react'
import uauth from '../uauth'

interface Props {
  onClose(): void
}

const Modal: React.FC<Props> = ({onClose}) => {
  const [domain, setDomain] = useState<string>('')

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setDomain(e.target.value)
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      ;(async () => {
        await uauth.login({
          username: domain,
          responseMode: 'query',
          beforeRedirect(options, url) {
            alert('Redirecting to ' + url)
          },
        })
      })()
    },
    [domain],
  )

  return (
    <div className="Modal">
      <div className="x" onClick={() => onClose()}>
        <div className="inner">X</div>
      </div>
      <div className="inner">
        <h1>Login</h1>
        <div className="input">
          <label htmlFor="domain">Domain:</label>
          <input
            type="text"
            name="domain"
            value={domain}
            onChange={handleChange}
          />
        </div>
        <button className="button" onClick={handleClick}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default Modal
