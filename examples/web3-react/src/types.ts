import {MetaMask} from '@web3-react/metamask'
import {WalletConnect} from '@web3-react/walletconnect'
import type {Web3ReactHooks} from '@web3-react/core'
import {Connector} from '@web3-react/types';

export abstract class AsyncConnector extends Connector {
  public abstract activate(...args: unknown[]): Promise<void>
}

export interface ConnectorManager {
  connector: Connector;
  hooks: Web3ReactHooks;
}

export enum ConnectionStatuses {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting'
}
