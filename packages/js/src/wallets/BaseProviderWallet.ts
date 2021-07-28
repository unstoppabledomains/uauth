import '../types.global'
import BaseWallet from './BaseWallet'

export default abstract class BaseProviderWallet extends BaseWallet {
  protected sendFromProvider(
    provider,
  ): (request: {method: string; params?: any[] | any}) => any {
    return request => {
      const send = provider.isMetaMask
        ? provider.request.bind(provider)
        : provider.sendAsync.bind(provider) || provider.send.bind(provider)

      let result = send(request)

      if (result.result) {
        result = result.result
      }

      return result
    }
  }

  protected handleConnect(connectInfo: any): void {
    if (BaseWallet.__DEV__) {
      console.log("Handling 'connect' event with payload", connectInfo)
    }
    this.emitUpdate({connected: true})
  }

  protected handleChainChanged(chainId: string | number): void {
    if (BaseWallet.__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({chainId, provider: window.ethereum})
  }

  protected handleAccountsChanged(accounts: string[]): void {
    if (BaseWallet.__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    if (accounts.length === 0) {
      this.emitUpdate({connected: false, account: null})
    } else {
      this.emitUpdate({account: accounts[0]})
    }
  }

  protected handleDisconnect(code: number, reason: string): void {
    if (BaseWallet.__DEV__) {
      console.log("Handling 'disconnect' event with payload", code, reason)
    }
    this.emitUpdate({connected: false})
  }

  async clientVersion(): Promise<string> {
    const provider = await this.provider()
    const send = this.sendFromProvider(provider)
    return send({method: 'web3_clientVersion'})
  }

  async chainId(): Promise<number | string> {
    const provider = await this.provider()
    const send = this.sendFromProvider(provider)

    let chainId
    try {
      chainId = await send({method: 'eth_chainId'})
    } catch (error) {
      if (BaseWallet.__DEV__) {
        console.warn(
          'eth_chainId request unsuccessful, falling back to provider properties',
        )
      }
    }

    if (!chainId) {
      chainId =
        provider.chainId ||
        provider.netVersion ||
        provider.networkVersion ||
        provider._chainId
    }

    if (!chainId) {
      throw new BaseWallet.NoChainIdError()
    }

    return chainId
  }

  async account(): Promise<string | null> {
    const provider = await this.provider()
    const send = this.sendFromProvider(provider)

    let account
    try {
      account = await send({method: 'eth_accounts'})
    } catch {
      if (BaseWallet.__DEV__) {
        console.warn(
          'eth_accounts was unsuccessful, falling back to provider.enable()',
        )
      }
    }

    if (!account) {
      try {
        account = await provider.enable()
      } catch {
        if (BaseWallet.__DEV__) {
          console.warn('provider.enable() was unsuccessful')
        }
      }
    }

    if (Array.isArray(account)) {
      return account[0]
    }

    return account
  }
}
