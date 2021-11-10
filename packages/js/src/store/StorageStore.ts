import {Store} from './types'

export default class StorageStore implements Store {
  constructor(public storage: Storage) {}

  get(key: string): string | null {
    const value = this.storage.getItem(key)

    if (value != null) {
      return JSON.parse(value)
    }

    return null
  }

  delete(key: string): boolean {
    this.storage.removeItem(key)
    return true
  }

  set(key: string, value): this {
    this.storage.setItem(key, JSON.stringify(value))
    return this
  }
}
