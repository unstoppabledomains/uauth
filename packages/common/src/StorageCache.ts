import {Cache} from './types'

export default class StorageCache implements Cache {
  constructor(private storage = window.localStorage) {}

  get(key: string): string | undefined {
    const value = this.storage.getItem(key)
    return typeof value === 'string' ? value : undefined
  }

  set(key: string, value: string): Cache {
    this.storage.setItem(key, value)
    return this
  }

  delete(key: string): boolean {
    const value = this.storage.getItem(key)
    this.storage.removeItem(key)
    return typeof value === 'string'
  }

  clear(): void {
    this.storage.clear()
  }

  entries(): IterableIterator<[string, string]> {
    const result: [string, string][] = []
    for (let index = 0; index < this.storage.length; index++) {
      const key = this.storage.key(index)
      if (typeof key === 'string') {
        const value = this.storage.getItem(key)
        if (typeof value === 'string') {
          result.push([key, value])
        }
      }
    }
    return result[Symbol.iterator]()
  }
}
