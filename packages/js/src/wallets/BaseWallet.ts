import {EventEmitter} from 'events'
import {WalletEvent, WalletFeatures, WalletUpdate} from './types'

class NoChainIdError extends Error {
  constructor() {
    super('no chainid associated with this wallet')
  }
}

class NoProviderError extends Error {
  constructor() {
    super('no chainid associated with this wallet')
  }
}

export default abstract class BaseWallet {
  public ee = new EventEmitter()

  static __DEV__ = true

  static NoChainIdError = NoChainIdError
  static NoProviderError = NoProviderError

  onUpdate(listener: (update: Partial<WalletUpdate>) => void): void {
    this.ee.on(WalletEvent.Update, listener)
  }

  onErrror(listener: (error: Error) => void): void {
    this.ee.on(WalletEvent.Update, listener)
  }

  protected emitUpdate(update: Partial<WalletUpdate>): void {
    this.ee.emit(WalletEvent.Update, update)
  }

  protected emitError(error: Error): void {
    this.ee.emit(WalletEvent.Error, {error})
  }

  /**
   * Should return full client version string
   */
  abstract clientVersion(): Promise<string>

  /**
   * Should emit connected update
   * Should throw if unable to connect
   */
  abstract connect(): Promise<void>

  /**
   * Should emit connected update
   * Should emit null account update
   * Should throw if unable to disconnect
   */
  abstract disconnect(): Promise<void>

  /**
   * Should return feature set it supports
   * Feature sets are not assumed to be dynamic, e.g. should remain the same per connection
   */
  abstract supports(): Promise<Partial<WalletFeatures>>

  /**
   * Should return if the wallet is connected
   */
  abstract connected(): Promise<boolean>

  /**
   * Should return provider
   * Should throw if no provider is available
   */
  abstract provider(): Promise<any>

  /**
   * Should return chainId
   * Should throw if no chainId is available
   */
  abstract chainId(): Promise<number | string>

  /**
   * Should return account
   * Should simply return null if no account is available
   */
  abstract account(): Promise<string | null>
}
