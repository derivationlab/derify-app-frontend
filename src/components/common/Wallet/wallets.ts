import { ConnectorIds } from '@/typings'
import { metaMaskConnector } from '@/utils/wagmiConfig'

export type Wallet<T = ConnectorIds> = {
  id: string
  icon: string
  title: string
  installed?: boolean
  connectorId: T
  downloadLink?: string
}

const wallets: Wallet[] = [
  {
    id: 'metaMask',
    icon: 'metamask.svg',
    title: 'MetaMask',
    get installed() {
      return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask && metaMaskConnector.ready
    },
    connectorId: ConnectorIds.MetaMask,
    downloadLink: 'https://metamask.io/download/'
  },
  {
    id: 'coinbaseWallet',
    icon: 'coinbase.svg',
    title: 'Coinbase Wallet',
    connectorId: ConnectorIds.WalletLink
  },
  {
    id: 'walletConnect',
    icon: 'wallet-connect.svg',
    title: 'WalletConnect',
    connectorId: ConnectorIds.WalletConnect
  }
]

export const getWallets = () => {
  return wallets
}
