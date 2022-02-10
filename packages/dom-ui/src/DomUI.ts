import AbstractUI, {UIOptions} from '@uauth/abstract-ui'
import {
  alert,
  close,
  container,
  content,
  footer,
  header,
  hidden,
  innerCircle,
  loading as loadingStyles,
  logo,
  middleCircle,
  outerCircle,
  overlay,
  title,
} from './styles'

const nameRegex =
  /^([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)(x|crypto|coin|wallet|bitcoin|888|nft|dao|blockchain)$/

export interface DomUIOptions {
  className?: string
  defaultValue: string
  container?: HTMLElement
  document?: Document
  id: string
  learnMoreLink: string
  getADomainLink: string
}

export type DomUIConstructorOptions = Partial<DomUIOptions>

class DomUI<T> implements AbstractUI<T> {
  public options: DomUIOptions

  getContainer(): HTMLElement {
    return this.options.container ?? window.document.body
  }

  getDocument(): Document {
    return this.options.document ?? window.document
  }

  constructor(options: DomUIConstructorOptions = {}) {
    options.id = options.id ?? 'uauth-vanilla-ui'
    options.learnMoreLink =
      options.learnMoreLink ??
      'https://unstoppabledomains.com/blog/login-with-unstoppable'
    options.getADomainLink =
      options.getADomainLink ?? 'https://unstoppabledomains.com'

    if (
      !options.learnMoreLink.startsWith('https://unstoppabledomains.com') ||
      !options.getADomainLink.startsWith('https://unstoppabledomains.com')
    ) {
      throw new Error(
        'Can only use https://unstoppabledomains.com based links.',
      )
    }

    this.options = options as DomUIOptions
  }

  getInnerHTML(defaultValue: string): string {
    return /* html */ `
<div class="${overlay}">

  <div class="${container}">
    <div id="${this.options.id}-close" class="${close}"></div>
    <div class="${header}">
      <div class="${logo}">
        <div class="${innerCircle}"></div>
        <div class="${middleCircle}"></div>
        <div class="${outerCircle}"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clip-rule="evenodd" fill="#2FE9FF" d="M22.7319 2.06934V9.87229L0 19.094L22.7319 2.06934Z" /><path fillRule="evenodd" clip-rule="evenodd" fill="#4C47F7" d="M18.4696 1.71387V15.1917C18.4696 19.1094 15.2892 22.2853 11.3659 22.2853C7.44265 22.2853 4.26221 19.1094 4.26221 15.1917V9.51682L8.52443 7.17594V15.1917C8.52443 16.5629 9.63759 17.6745 11.0107 17.6745C12.3839 17.6745 13.497 16.5629 13.497 15.1917V4.4449L18.4696 1.71387Z" /></svg>
      </div>
      <div class="${title}">Login with Unstoppable</div>
    </div>

    <div class="${content}">
      <form id="${this.options.id}-form">
        <input 
          id="${this.options.id}-input"
          type="text"
          spellcheck="false"
          autocapitalize="none"
          autocomplete="off"
          placeholder="Enter your domain name"
          autofocus
          value="${defaultValue}"
          />
        <div id="${this.options.id}-error" class="${alert} ${hidden}"></div>
        <button type="submit" id="${this.options.id}-button">Continue</button>
      </form>
    </div>

    <div class="${footer}">
      <a href="${this.options.learnMoreLink}">
        <svg class="svg-inline--fa fa-question-circle fa-w-16" aria-hidden="true" focusable="false" data-prefix="far" data-icon="question-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"></path>
        </svg>
        <div>Learn More</div>
      </a>
      <a href="${this.options.getADomainLink}">
        <svg class="svg-inline--fa fa-external-link-alt fa-w-16" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path>
        </svg>
        <div>Get a Domain</div>
      </a>
    </div>

  </div>

</div>
    `
  }

  async open(options: UIOptions<T>): Promise<T> {
    const {className, id} = this.options

    let element: HTMLElement
    const existingElement = this.getDocument().getElementById(id)
    if (existingElement) {
      element = existingElement
    } else {
      element = this.getDocument().createElement('div')
      element.id = id
    }

    if (typeof className === 'string') {
      element.className = className
    }
    element.classList.add('uauth-vanilla-ui')

    element.innerHTML = this.getInnerHTML(
      options.defaultValue ?? this.options.defaultValue,
    )

    if (!element.parentElement) {
      this.getContainer().appendChild(element)
    }

    const inputElement: HTMLInputElement = this.getDocument().getElementById(
      `${this.options.id}-input`,
    ) as HTMLInputElement
    if (!inputElement) {
      throw new Error('Unable to find inputElement in modal')
    }

    const formElement = this.getDocument().getElementById(
      `${this.options.id}-form`,
    ) as HTMLFormElement
    if (!formElement) {
      throw new Error('Unable to find formElement in modal')
    }

    const closeElement = this.getDocument().getElementById(
      `${this.options.id}-close`,
    ) as HTMLElement
    if (!closeElement) {
      throw new Error('Unable to find closeElement in modal')
    }

    const errorElement = this.getDocument().getElementById(
      `${this.options.id}-error`,
    ) as HTMLElement
    if (!errorElement) {
      throw new Error('Unable to find errorElement in modal')
    }

    const buttonElement = this.getDocument().getElementById(
      `${this.options.id}-button`,
    ) as HTMLElement
    if (!errorElement) {
      throw new Error('Unable to find buttonElement in modal')
    }

    function setError(error: Error | void) {
      if (error) {
        errorElement.innerText = error.message
        errorElement.classList.remove(hidden)

        buttonElement.classList.add(hidden)
      } else {
        errorElement.innerText = ''
        errorElement.classList.add(hidden)

        buttonElement.classList.remove(hidden)
      }
    }

    let loading = false
    function setLoading(isLoading: boolean) {
      loading = isLoading

      if (isLoading) {
        buttonElement.setAttribute('disabled', 'disabled')
        buttonElement.innerHTML = `<div class="${loadingStyles}"></div>`
      } else {
        buttonElement.removeAttribute('disabled')
        buttonElement.innerText = 'Continue'
      }
    }

    let domain = inputElement.value
    let shouldClose = true
    let handleKeydown: (this: Document, ev: KeyboardEvent) => any
    return new Promise<T>((resolve, reject) => {
      this.getDocument().addEventListener(
        'keydown',
        (handleKeydown = e => {
          if (e.key === 'Escape') {
            reject(new Error('Modal closed!'))
          }
        }),
      )

      inputElement.oninput = e => {
        // This is a trick to make the input non-interactive while the form is submitting
        if (!loading) {
          // NOTE: We cannot simply use .replace(/\s/, '-') because double space periods wouldn't work.
          // TODO: Simpify this...
          domain = inputElement.value
            .toLowerCase()
            .replace(/(^-)|(^\s+)/gi, '') // No extra space at front of string
            .replace(/(-\s+)|(\s+-)|(--)/gi, '-') // No double hyphens or extra space next to existing hyphens
            .replace(/(\.\.)|(\s+\.)/gi, '.') // No double periods or space before periods
            .replace(/\.\s+([a-z0-9]+)/gi, '.$1') // Removes spaces after periods and before labels
            .replace(/([a-z0-9]+)\s+([a-z0-9]+)/gi, '$1-$2') // Replace spaces inbetween words with hyphens

          setError(undefined)
        }
        inputElement.value = domain
      }

      formElement.onsubmit = e => {
        e.preventDefault()
        Promise.resolve()
          .then(async () => {
            if (!nameRegex.test(domain)) {
              throw new Error(`Domain ${domain} is invalid`)
            }

            setLoading(true)
            resolve(await options.submit(domain))
            if (!options.closeOnFinish) {
              shouldClose = false
            }
          })
          .catch(error => {
            setLoading(false)
            setError(error)
          })
      }

      closeElement.onclick = () => {
        reject(new Error('Modal closed!'))
      }

      this._closer = () => {
        this.getDocument().removeEventListener('keydown', handleKeydown)
        this.getContainer().removeChild(element)
      }
    }).finally(async () => {
      if (shouldClose) {
        this.close()
      }
    })
  }

  private _closer?: () => void
  close(): void {
    if (this._closer) {
      this._closer()
      delete this._closer
    }
  }
}

export default DomUI
