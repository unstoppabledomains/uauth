import initOnboard from 'bnc-onboard'
import React, {useContext, useMemo, useState} from 'react'
import uauthOnboard from './uauthOnboard'

export interface OnboardContextValue {
  onboard: ReturnType<typeof initOnboard>
  state: ReturnType<ReturnType<typeof initOnboard>['getState']>
  address?: string
  ens?: any
  network?: number
  balance?: string
  wallet?: any
}

export const OnboardContext = React.createContext<OnboardContextValue>(
  null as any,
)

type OnboardParams = Omit<Parameters<typeof initOnboard>[0], 'subscriptions'>

export interface OnboardProviderProps extends OnboardParams {
  onNewOnboard?(onboard: ReturnType<typeof initOnboard>): void
}

export const OnboardProvider: React.FC<OnboardProviderProps> = ({
  children,
  onNewOnboard,
  ...options
}) => {
  const [address, setAddress] = useState<string>()
  const [ens, setEns] = useState<any>()
  const [network, setNetwork] = useState<number>()
  const [balance, setBalance] = useState<string>()
  const [wallet, setWallet] = useState<any>()

  const onboard = useMemo(() => {
    const api = initOnboard({
      ...options,
      subscriptions: {
        address: setAddress,
        ens: setEns,
        network: setNetwork,
        balance: setBalance,
        wallet: wallet => {
          if (wallet) {
            window.localStorage.setItem('selectedWallet', wallet.name!)
          }

          setWallet(wallet)
        },
      },
    })

    if (typeof onNewOnboard === 'function') {
      onNewOnboard(api)
    }

    const previouslySelectedWallet =
      window.localStorage.getItem('selectedWallet')
    if (previouslySelectedWallet != null) {
      if (previouslySelectedWallet === 'Unstoppable') {
        uauthOnboard
          .getUAuth()
          .then(async uauth => {
            await uauth.user()
            await api.walletSelect('Unstoppable')
          })
          .catch(() => {
            window.localStorage.removeItem('selectedWallet')
          })
      } else {
        api.walletSelect(previouslySelectedWallet)
      }
    }

    return api
  }, [])

  // walletSelect?: WalletSelectModuleOptions;
  // walletCheck?: Array<WalletCheckModule | WalletCheckInit>;

  const value: OnboardContextValue = {
    onboard,
    address,
    ens,
    network,
    balance,
    wallet,
    get state() {
      return onboard.getState()
    },
  }

  return <OnboardContext.Provider value={value} children={children} />
}

export const useOnboard = () => useContext(OnboardContext)
