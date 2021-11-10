class AsyncValue<T = any> implements PromiseLike<T> {
  requestId = 0
  state?: T
  error?: Error
  _promise?: Promise<void>
  canUse = true

  use(promise: Promise<T>): void {
    if (!this.canUse) {
      throw new Error('Cannot use new Promise')
    }

    const id = ++this.requestId
    delete this.state
    delete this.error
    this._promise = promise
      .then(result => {
        if (this.requestId === id) {
          this.state = result
          delete this._promise
        }
      })
      .catch(error => {
        if (this.requestId === id) {
          this.error = error
          delete this._promise
        }
      })
  }

  get promise(): Promise<T> {
    this.canUse = false
    return (async () => {
      await this._promise

      if (this.error) {
        this.canUse = true
        throw this.error
      }
      this.canUse = true
      return this.state!
    })()
  }

  then: PromiseLike<T>['then'] = (onfulfilled, onrejected) => {
    return this.promise.then(onfulfilled, onrejected)
  }
}

export default AsyncValue
