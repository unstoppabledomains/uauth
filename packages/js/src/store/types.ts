export type StoreType = 'localstore' | 'sessionstore' | 'memory'

export interface Store<T = any> {
  keys?(): Promise<IterableIterator<string>> | IterableIterator<string>
  get(key: string): Promise<T | undefined | null> | T | undefined | null
  delete(key: string): Promise<boolean> | boolean
  set(key: string, value: T): Promise<this> | this
}
