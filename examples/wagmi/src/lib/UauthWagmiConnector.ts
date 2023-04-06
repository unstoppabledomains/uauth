import type UAuth from '@uauth/js'
import type { UAuthConstructorOptions, UserInfo } from '@uauth/js'
import { Connector } from '@wagmi/connectors';
import {
  Ethereum,
  UserRejectedRequestError,
  normalizeChainId
} from "@wagmi/core";
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { providers } from "ethers";
import { Chain, mainnet } from 'wagmi/chains'
import { getAddress } from "ethers/lib/utils.js";
import { ConnectorData } from 'wagmi';

// import {VERSION} from './version'
const VERSION = '2.6.0'

if (typeof window !== 'undefined') {
  const _w = window as any
  _w.UAUTH_VERSION = _w.UAUTH_VERSION || {}
  _w.UAUTH_VERSION.WEB3_REACT = VERSION
}

type UAuthWagmiConnectorOptions = UAuthConstructorOptions & {
  uauth?: UAuth
  metaMaskConnector?: MetaMaskConnector
  walletConnectConnector?: WalletConnectConnector
  shouldLoginWithRedirect?: boolean

  // If projectId is provided, wallet connect version 2 will be assumed,
  // Otherwise wc version 1 will be assumed
  projectId?: string
}

class UauthWagmiConnector extends Connector {
  id: string
  name: string
  ready: boolean
  public provider?: Ethereum | WalletConnectProvider | undefined
  private _metaMaskConnector?: MetaMaskConnector
  private _walletConnectConnector?: WalletConnectConnector
  private _wcProjectId: string
  private _subConnector?: Connector
  private _uauth?: UAuth
  static UAuth: typeof UAuth

  static registerUAuth(pkg: typeof UAuth): void {
    UauthWagmiConnector.UAuth = pkg
  }

  public static async importUAuth(): Promise<void> {
    if (UauthWagmiConnector.UAuth == null) {
      UauthWagmiConnector.UAuth = (await import('@uauth/js').then(
        m => m?.default ?? m,
      )) as typeof UAuth
    }
  }

  protected onAccountsChanged(accounts: `0x${string}`[]): void {
    if (accounts.length === 0)
        this.emit("disconnect");
      else
        this.emit("change", { account: getAddress(accounts[0]) });
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  }

  protected onDisconnect(error: Error): void {
    this.emit("disconnect");
  }

  constructor({ chains, options, }: {
      chains?: Chain[];
      options: UAuthWagmiConnectorOptions;
    }) {
      super({ chains, options });
      this.id = "custom-uauth"
      this.name = "UauthWagmiConnector"
      this._wcProjectId = "c5ab4f92a988df5d37b857199a9dbfc5"
      this.initConnectors();
      this.ready = true
    }

  initConnectors() {
    if (!this._metaMaskConnector) {
      this._metaMaskConnector = new MetaMaskConnector()
    }
    if (!this._walletConnectConnector) {
      this._walletConnectConnector = new WalletConnectConnector({
        options: {
          showQrModal: false,
          projectId: this._wcProjectId,
        },
      })
    }
  }

  // Return wagmi ConnectorData
  async connect(): Promise<any> {
    await UauthWagmiConnector.importUAuth()

    this.emit("message", { type: "connecting" });

    let user: UserInfo
    try {
      user = await this.uauth.user()
    } catch (error) {
      if (!this.uauth.fallbackLoginOptions.scope.includes('wallet')) {
        throw new Error(
          'Must request the "wallet" scope for connector to work.',
        )
      }

      if (this.options.shouldLoginWithRedirect) {
        await this.uauth.login({
          packageName: '@uauth/web3-react',
          packageVersion: VERSION,
        })

        // NOTE: We don't want to throw because the page will take some time to
        // load the redirect page.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await new Promise<void>(() => {})
        // We need to throw here otherwise typescript won't know that user isn't null.
        throw new Error('Should never get here.')
      } else {
        await this.uauth.loginWithPopup({
          packageName: '@uauth/web3-react',
          packageVersion: VERSION,
        })
        user = await this.uauth.user()
      }
    }

    if (user.wallet_type_hint == null) {
      throw new Error('no wallet type present')
    }

    // Set the underlying subconnector
    if (['web3', 'injected'].includes(user.wallet_type_hint)) {
      this._subConnector = this._metaMaskConnector
    } else if (user.wallet_type_hint === 'walletconnect') {
      this._subConnector = this._walletConnectConnector
    } else {
      throw new Error('Connector not supported')
    }

    // Should be connected, ensure that the subconnector is connected also
    try {
      await this._subConnector!.connect()
    } catch (error) {
      throw error;
    }

    // Set the provider using subconnector
    const provider = await this._subConnector?.getProvider();
    this.provider = provider
    if (!this.provider) {
      throw new Error('Provider not found')
    }
    if (provider.on) {
      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
      provider.on("disconnect", this.onDisconnect);
    }

    const accountPromise = async (): Promise<`0x${string}`> => {
      const accounts = await provider.request({
          method: "eth_requestAccounts"
        });
      const connectedAccount = accounts[0];
      const formattedAddress = getAddress(connectedAccount);
        const account: `0x${string}` = formattedAddress ?? '0x0';
        return account;
    }

    const chainPromise = async (): Promise<{ id: number; unsupported: boolean; }> => {
      const providerChain = await provider.request({
        method: "eth_chainId"
      });
      const id = normalizeChainId(providerChain);
      const unsupported = this.isChainUnsupported(id);
      return { id, unsupported };
    }

    const providerPromise = async (): Promise<any> => {
      return new providers.Web3Provider(
        provider
      )
    }

    let connectorData: ConnectorData;
    try {
      const data = await Promise.all([accountPromise(), chainPromise(), providerPromise()]);
      connectorData = {
        account: data[0],
        chain: data[1],
        provider: data[2]
      }
      return connectorData;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new UserRejectedRequestError(error);
      }
      if (error.code === -32002) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      throw error;
    }
  }

  async disconnect() {
  }

  async getAccount() {
    const provider = await this.getProvider();
    const accounts: string[] = await provider!.request({
      method: "eth_accounts"
    });
    const account = getAddress(accounts[0]);
    return account;
  }
  async getChainId() {
    const provider = await this.getProvider();
    const chainId: string | number | bigint = await provider!.request({
      method: "eth_chainId"
    });
    return normalizeChainId(chainId);
  }

  async getProvider(): Promise<Ethereum | WalletConnectProvider | undefined> {
    const subProvider = await this._subConnector?.getProvider()
    return subProvider;
  }

  async getSigner({ chainId = mainnet.id } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount()
    ]);
    return new providers.Web3Provider(
      provider as providers.ExternalProvider || providers.JsonRpcProvider,
      chainId
    ).getSigner(account);
  }
  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  public get uauth(): UAuth {
    const {uauth, shouldLoginWithRedirect, ...uauthOptions} =
      this.options

    if (uauth) {
      return uauth
    }

    if (this._uauth) {
      return this._uauth
    }

    if (UauthWagmiConnector.UAuth == null) {
      throw new Error('Must import UAuth before constructing a UAuth Object')
    }

    if (!uauthOptions.clientID || !uauthOptions.redirectUri) {
      throw new Error('Incomplete constructor options')
    }

    this._uauth = new UauthWagmiConnector.UAuth(
      uauthOptions as UAuthConstructorOptions,
    )

    return this._uauth
  }

  public get subConnector(): Connector & {
    isAuthorized?(): Promise<boolean>
  } {
    if (this._subConnector == null) {
      throw new Error('no subconnector')
    }

    return this._subConnector
  }
}

export default UauthWagmiConnector