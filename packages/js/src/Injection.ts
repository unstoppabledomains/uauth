import AsyncValue from './AsyncValue'

class Injection<T> {
  domain = ''
  result = new AsyncValue<T>()

  constructor(public builder: (username: string) => Promise<T>) {}

  onChange = (domain: string): void => {
    this.domain = domain
    this.result.use(this.builder(domain))
  }

  build = async (domain: string): Promise<T> => {
    // if (this.domain === '') {
    //   throw new Error('You must enter a domain name')
    // }

    // console.log('Injection onSubmit domains:', domain, this.domain)

    if (domain !== this.domain) {
      throw new Error("Domains don't match")
    }

    return this.result
  }
}

export default Injection
