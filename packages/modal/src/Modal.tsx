import React, {useCallback, useEffect, useState} from 'react'
import './Modal.css'

interface Props {
  resolve(string: string): void
  reject(error: Error): void
  buildRedirectURI(domain: string): Promise<string>
}

class LazyCache {
  promises: Record<string, Promise<string>> = {}
  values: Record<string, string> = {}

  set(key: string, promise: Promise<string>): void {
    if (!this.has(key)) {
      this.promises[key] = promise
    }
  }

  has(key: string): boolean {
    return (
      Object.prototype.hasOwnProperty.call(this.promises, key) ||
      Object.prototype.hasOwnProperty.call(this.values, key)
    )
  }

  async get(key: string): Promise<string> {
    if (Object.prototype.hasOwnProperty.call(this.promises, key)) {
      this.values[key] = await this.promises[key]
    }

    return this.values[key]
  }
}

const cache = new LazyCache()

const nameRegex =
  /^([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)(x|crypto|coin|wallet|bitcoin|888|nft|dao|zil|blockchain)$/

function retry<T>(
  fn: () => Promise<T>,
  retries = 5,
  timeout = 500,
  factor = 2,
  err = null,
): Promise<T> {
  if (retries <= 0) {
    return Promise.reject(err)
  }

  return fn().catch(async err => {
    await new Promise(r => setTimeout(r, timeout))
    return retry(fn, retries - 1, timeout * factor, factor, err)
  })
}

const Modal: React.FC<Props> = ({resolve, reject, buildRedirectURI}) => {
  const [domain, setDomain] = useState(
    window.localStorage.getItem('uauth-modal-suggestion') || '',
  )
  const [alert, setAlert] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault()

      if (domain === '') return
      if (!nameRegex.test(domain)) {
        setAlert(`"${domain}" is invalid.`)
        return
      }

      setLoading(true)
      retry(() => buildRedirectURI(domain))
        .then(uri => {
          window.localStorage.setItem('uauth-modal-suggestion', domain)
          resolve(uri)
        })
        .catch(reject)
        .finally(() => setLoading(false))
    },
    [domain],
  )

  const handleDomainChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setAlert('')
    setDomain(
      e.target.value
        .toLowerCase()
        .replace(/\s|_|(--)/, '-')
        .replace(/-\.|\.-/, '.'),
    )
  }

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = e => {
    reject(new Error('Modal closed!'))
  }

  // Closes the modal when esc is pressed
  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        reject(new Error('Modal closed!'))
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])

  return (
    <div className="modal">
      <link
        rel="stylesheet"
        href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&amp;lang=en"
      />
      <div className="modal-overlay">
        <div className="modal-container">
          <button className="modal-close" onClick={handleClose} />
          <div className="modal-header">
            <div className="modal-logo">
              <div className="modal-logo-circle-middle"></div>
              <div className="modal-logo-circle-outer"></div>
              <div className="modal-logo-circle-outerouter"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.7319 2.06934V9.87229L0 19.094L22.7319 2.06934Z"
                  fill="#2FE9FF"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.4696 1.71387V15.1917C18.4696 19.1094 15.2892 22.2853 11.3659 22.2853C7.44265 22.2853 4.26221 19.1094 4.26221 15.1917V9.51682L8.52443 7.17594V15.1917C8.52443 16.5629 9.63759 17.6745 11.0107 17.6745C12.3839 17.6745 13.497 16.5629 13.497 15.1917V4.4449L18.4696 1.71387Z"
                  fill="#4C47F7"
                />
              </svg>
            </div>
            <div className="modal-title">Login with Unstoppable</div>
          </div>
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="Enter your domain name"
                value={domain}
                onChange={handleDomainChange}
              />
              {alert !== '' ? (
                <div className="model-alert">{alert}</div>
              ) : (
                <button type="submit" disabled={domain === '' || loading}>
                  {domain === ''
                    ? 'Continue'
                    : loading
                    ? 'Loading...'
                    : 'Continue'}
                </button>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <a
              className="modal-footer-learn"
              href="https://unstoppabledomains.com"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="far"
                data-icon="question-circle"
                className="svg-inline--fa fa-question-circle fa-w-16"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"
                ></path>
              </svg>

              <div>Learn More</div>
            </a>
            <a
              className="modal-footer-get-domain"
              href="https://unstoppabledomains.com"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="external-link-alt"
                className="svg-inline--fa fa-external-link-alt fa-w-16"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"
                ></path>
              </svg>
              <div>Get a Domain</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
